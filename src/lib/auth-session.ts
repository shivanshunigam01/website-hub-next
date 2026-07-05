import type { AuthRole, AuthSession, AuthUser } from "@/lib/auth-types";

const AUTH_DEBUG = process.env.NEXT_PUBLIC_API_DEBUG === "true";

function pickToken(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) return value.trim();
  }
  return "";
}

/** Collect nested objects that may hold auth fields (data, tokens, etc.). */
function collectAuthLayers(raw: unknown): Record<string, unknown>[] {
  const layers: Record<string, unknown>[] = [];
  const seen = new Set<unknown>();

  const visit = (value: unknown, depth = 0) => {
    if (!value || typeof value !== "object" || seen.has(value) || depth > 4) return;
    seen.add(value);
    const obj = value as Record<string, unknown>;
    layers.push(obj);

    visit(obj.data, depth + 1);
    visit(obj.tokens, depth + 1);
    visit(obj.token, depth + 1);
    visit(obj.user, depth + 1);
  };

  visit(raw);
  return layers;
}

function extractUser(layers: Record<string, unknown>[]): AuthUser | null {
  for (const layer of layers) {
    const nested = layer.user;
    if (nested && typeof nested === "object") {
      const u = nested as AuthUser;
      if (u.email || u.id) return u;
    }
  }

  for (const layer of layers) {
    if (typeof layer.email !== "string") continue;
    const role = layer.role as AuthRole | undefined;
    if (!role) continue;

    return {
      id: String(layer.id ?? ""),
      name: String(layer.name ?? ""),
      email: layer.email,
      role,
      avatarUrl: (layer.avatarUrl as string | null | undefined) ?? null,
      phone: layer.phone as string | undefined,
      phoneCountryCode: layer.phoneCountryCode as string | undefined,
      theme: layer.theme as "light" | "dark" | undefined,
      locale: layer.locale as string | undefined,
      profileComplete: Boolean(layer.profileComplete),
      isActive: layer.isActive as boolean | undefined,
      isVerified: layer.isVerified as boolean | undefined,
      teacherProfile: layer.teacherProfile as AuthUser["teacherProfile"],
      studentProfile: layer.studentProfile as AuthUser["studentProfile"],
    };
  }

  return null;
}

function extractTokens(layers: Record<string, unknown>[]) {
  let accessToken = "";
  let refreshToken = "";

  for (const layer of layers) {
    const tokens =
      layer.tokens && typeof layer.tokens === "object"
        ? (layer.tokens as Record<string, unknown>)
        : null;

    accessToken = pickToken(
      accessToken,
      layer.accessToken,
      layer.access_token,
      layer.token,
      tokens?.accessToken,
      tokens?.access_token,
      tokens?.token,
    );

    refreshToken = pickToken(
      refreshToken,
      layer.refreshToken,
      layer.refresh_token,
      tokens?.refreshToken,
      tokens?.refresh_token,
    );
  }

  return { accessToken, refreshToken };
}

/** Normalize login/register payload from backend response. */
export function normalizeAuthPayload(raw: unknown): AuthSession {
  if (AUTH_DEBUG) {
    console.log("[auth] normalizeAuthPayload input", raw);
  }

  const layers = collectAuthLayers(raw);
  const user = extractUser(layers);
  const { accessToken, refreshToken } = extractTokens(layers);

  if (AUTH_DEBUG) {
    console.log("[auth] parsed fields", {
      hasUser: Boolean(user),
      userId: user?.id,
      userEmail: user?.email,
      accessTokenPresent: Boolean(accessToken),
      refreshTokenPresent: Boolean(refreshToken),
      tokenFieldNames: layers.flatMap((layer) =>
        Object.keys(layer).filter((k) => /token|access/i.test(k)),
      ),
    });
  }

  if (!user?.email && !user?.id) {
    throw new Error("Login response missing user data. Check API response shape.");
  }

  if (!accessToken) {
    throw new Error(
      "Login response missing access token (expected accessToken, token, or data.accessToken).",
    );
  }

  const profileComplete = layers.some((layer) => layer.profileComplete === true)
    ? true
    : Boolean(user.profileComplete ?? false);

  return {
    user,
    accessToken,
    refreshToken,
    profileComplete,
  };
}
