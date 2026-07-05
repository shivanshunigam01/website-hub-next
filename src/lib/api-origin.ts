import { API_ORIGIN as DEFAULT_API_ORIGIN, normalizeApiOrigin } from "./site-config";

const DEV_API_ORIGIN = process.env.NEXT_PUBLIC_API_ORIGIN || "http://localhost:4000";

function stripApiSuffix(url: string) {
  return normalizeApiOrigin(url.replace(/\/api\/v1\/?$/i, ""));
}

/** Public backend origin (no /api/v1) — from env only. */
export function getApiOrigin(): string {
  const configured =
    process.env.NEXT_PUBLIC_API_ORIGIN ||
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL;

  if (configured) return stripApiSuffix(configured);

  if (process.env.NODE_ENV === 'development') return DEV_API_ORIGIN;

  return DEFAULT_API_ORIGIN;
}

export function resolveAssetUrl(stored?: string | null): string | undefined {
  const value = stored?.trim();
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;

  const base = getApiOrigin();
  if (!base) return value.startsWith("/") ? value : `/${value}`;

  if (value.startsWith("/")) return `${base}${value}`;
  if (value.includes("/")) return `${base}/${value.replace(/\\/g, "/")}`;
  return `${base}/uploads/approved/${value}`;
}
