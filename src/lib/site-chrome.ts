/** Routes where support FABs / scroll-top would cover forms or composers. */
const HIDE_SUPPORT_PREFIXES = [
  "/admin",
  "/teacher",
  "/student",
  "/parent",
  "/lms",
  "/messages",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/role-select",
  "/verify-email",
  "/support",
  "/contact",
  "/post-requirement",
  "/reviews",
  "/marketplace",
  "/accommodation",
  "/tutor-jobs",
  "/payments",
] as const;

const HIDE_SUPPORT_EXACT = new Set(["/profile"]);

/** Hide ChatWidget / WhatsApp / ScrollToTop. */
export function shouldHideSupportWidgets(pathname: string): boolean {
  const path = pathname || "/";
  if (HIDE_SUPPORT_EXACT.has(path)) return true;
  return HIDE_SUPPORT_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));
}

/** Dashboard-style chrome (no marketing footer / mobile nav). */
export function isDashboardPath(pathname: string): boolean {
  const path = pathname || "/";
  return (
    path === "/profile" ||
    path.startsWith("/admin") ||
    path.startsWith("/teacher") ||
    path.startsWith("/student") ||
    path.startsWith("/parent") ||
    path.startsWith("/lms")
  );
}

/** Quiet pages: no marketing footer / bottom nav (includes messages + form-heavy). */
export function shouldShowMarketingChrome(pathname: string): boolean {
  const path = pathname || "/";
  if (isDashboardPath(path)) return false;
  if (path.startsWith("/messages")) return false;
  // Auth pages: keep footer optional but hide MobileNav + FABs via hideSupport;
  // still show footer on marketing-ish routes. Hide MobileNav on auth for cleaner forms.
  if (
    path.startsWith("/login") ||
    path.startsWith("/register") ||
    path.startsWith("/forgot-password") ||
    path.startsWith("/reset-password") ||
    path.startsWith("/role-select") ||
    path.startsWith("/verify-email")
  ) {
    return false;
  }
  return true;
}
