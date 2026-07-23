import type { AuthRole } from "@/lib/auth-types";

export function afterAuthPath(
  role: AuthRole,
  profileComplete: boolean,
  isVerified = true,
) {
  if ((role === "teacher" || role === "student" || role === "parent") && !isVerified) {
    return "/verify-email";
  }
  if (role === "teacher" && !profileComplete) {
    return "/teacher/onboarding/profile";
  }
  if (role === "student" && !profileComplete) {
    return "/profile";
  }
  if (role === "parent" && !profileComplete) {
    return "/profile";
  }
  if (role === "teacher") return "/teacher";
  if (role === "student") return "/student";
  if (role === "parent") return "/parent";
  return "/admin";
}

export const TEACHER_ONBOARDING_PATH = "/teacher/onboarding/profile";

/** Parse `/path?a=1&b=2` redirects for TanStack Router navigation. */
export function parseAuthRedirect(redirect?: string) {
  if (!redirect || !redirect.startsWith("/")) return null;

  const qIndex = redirect.indexOf("?");
  if (qIndex === -1) {
    return { to: redirect, search: {} as Record<string, string | undefined> };
  }

  const to = redirect.slice(0, qIndex);
  const params = new URLSearchParams(redirect.slice(qIndex + 1));
  const search: Record<string, string | undefined> = {};
  params.forEach((value, key) => {
    search[key] = value;
  });

  return { to, search };
}

export async function navigateAfterAuth(
  nav: (opts: { to: string; search?: Record<string, string | undefined> }) => Promise<unknown>,
  redirect?: string,
  fallbackPath?: string,
) {
  const parsed = parseAuthRedirect(redirect);
  if (parsed) {
    await nav({ to: parsed.to, search: parsed.search });
    return;
  }
  if (fallbackPath) {
    await nav({ to: fallbackPath });
  }
}
