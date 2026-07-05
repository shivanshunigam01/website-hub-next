import { API_BASE as DEFAULT_API_BASE, normalizeApiBase } from "./site-config";

const DEV_API = "http://localhost:4000/api/v1";

function resolveApiBase(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
  if (configured) return normalizeApiBase(configured);
  if (process.env.NODE_ENV === 'development') return DEV_API;
  return DEFAULT_API_BASE;
}

const API_BASE = resolveApiBase();

export { getApiOrigin, resolveAssetUrl } from "./api-origin";

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: { field?: string; message: string }[],
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

function humanizeField(field?: string): string {
  if (!field) return "";
  const name = field.replace(/^(body|query|params)\./, "");
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export const AUTH_ERROR_CODES = {
  accountNotRegistered: "ACCOUNT_NOT_REGISTERED",
} as const;

export function isAccountNotRegisteredError(err: unknown): boolean {
  if (!(err instanceof ApiRequestError)) return false;
  if (err.errors?.some((e) => e.message === AUTH_ERROR_CODES.accountNotRegistered)) {
    return true;
  }
  return /not registered/i.test(err.message);
}

/** Show the backend's message (and field errors when the top-level message is generic). */
export function formatApiErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  if (err instanceof ApiRequestError) {
    const { message, errors } = err;
    if (errors?.length) {
      const parts = errors.map((e) => {
        const label = humanizeField(e.field);
        return label ? `${label}: ${e.message}` : e.message;
      });
      if (message === "Validation failed" || message === "Duplicate field") {
        return parts.join(". ");
      }
      if (parts.length === 1 && parts[0] !== message) {
        return parts[0];
      }
    }
    return message || fallback;
  }
  if (err instanceof Error && err.message.trim()) return err.message;
  return fallback;
}

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
  errors?: { field?: string; message: string }[];
};

const ACCESS_KEY = "tp_access_token";
const REFRESH_KEY = "tp_refresh_token";

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = typeof window !== "undefined" ? localStorage.getItem(REFRESH_KEY) : null;
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    const json = (await res.json()) as ApiEnvelope<{ accessToken: string }>;
    if (!res.ok || !json.success || !json.data?.accessToken) return null;
    localStorage.setItem(ACCESS_KEY, json.data.accessToken);
    return json.data.accessToken;
  } catch {
    return null;
  }
}

export async function api<T>(path: string, options: RequestInit = {}, retried = false): Promise<T> {
  return apiRequest<T>(path, options, { auth: true, retried });
}

/** Public auth endpoints — never attach the logged-in user's JWT. */
export async function apiPublic<T>(path: string, options: RequestInit = {}): Promise<T> {
  return apiRequest<T>(path, options, { auth: false, retried: false });
}

async function apiRequest<T>(
  path: string,
  options: RequestInit,
  { auth, retried }: { auth: boolean; retried: boolean },
): Promise<T> {
  const token = auth && typeof window !== "undefined" ? localStorage.getItem(ACCESS_KEY) : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  let json: ApiEnvelope<T>;
  try {
    json = (await res.json()) as ApiEnvelope<T>;
  } catch {
    throw new ApiRequestError(res.statusText || "Request failed", res.status);
  }

  if (
    auth &&
    (!res.ok || !json.success) &&
    res.status === 401 &&
    !retried &&
    token &&
    path !== "/auth/refresh"
  ) {
    const newToken = await refreshAccessToken();
    if (newToken) return apiRequest<T>(path, options, { auth: true, retried: true });
  }

  if (!res.ok || !json.success) {
    throw new ApiRequestError(json.message || res.statusText || "Request failed", res.status, json.errors);
  }
  return json.data;
}

export function getApiBaseUrl() {
  return API_BASE;
}

export type UploadResult = {
  url: string;
  filename: string;
  mimetype: string;
  size: number;
  mediaType?: "image" | "video" | "file";
};

/** Upload image or video (multipart). Requires auth token. */
export async function apiUpload(
  file: File,
  purpose?: "avatar" | "media" | "approved",
): Promise<UploadResult> {
  const token = typeof window !== "undefined" ? localStorage.getItem(ACCESS_KEY) : null;
  const fd = new FormData();
  fd.append("file", file);

  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const qs = purpose ? `?purpose=${encodeURIComponent(purpose)}` : "";
  const res = await fetch(`${API_BASE}/upload${qs}`, { method: "POST", headers, body: fd });
  let json: ApiEnvelope<UploadResult>;
  try {
    json = (await res.json()) as ApiEnvelope<UploadResult>;
  } catch {
    throw new ApiRequestError(res.statusText || "Upload failed", res.status);
  }
  if (!res.ok || !json.success) {
    throw new ApiRequestError(json.message || "Upload failed", res.status, json.errors);
  }
  return json.data;
}
