/** Public site identity — single source of truth for SEO, AEO, and meta tags. */
export const SITE_NAME = "TeacherPoint";
export const SITE_TAGLINE = "Find the best tutors and online courses";
export const SITE_DESCRIPTION =
  "Find verified online tutors, home teachers, and courses worldwide. Search by subject, read ratings & reviews, apply for teaching jobs, and access free learning resources on TeacherPoint.";

/** Canonical production URLs (prefer www). */
export const SITE_URL = "https://www.teacherpoint.org";
export const SITE_URL_APEX = "https://teacherpoint.org";
export const API_ORIGIN = "https://api.teacherpoint.org";
export const API_BASE = `${API_ORIGIN}/api/v1`;

/** Map legacy or mistyped env values to the canonical production API. */
export function normalizeApiOrigin(input: string): string {
  return input.trim().replace(/\/$/, "").replace(/^https:\/\/api\.teacherpoint\.in\b/i, API_ORIGIN);
}

export function normalizeApiBase(input: string): string {
  const trimmed = input.trim().replace(/\/$/, "");
  const withOrigin = trimmed.replace(/^https:\/\/api\.teacherpoint\.in\b/i, API_ORIGIN);
  if (/\/api\/v1$/i.test(withOrigin)) return withOrigin;
  if (/^https?:\/\//i.test(withOrigin)) return `${normalizeApiOrigin(withOrigin)}/api/v1`;
  return `${API_ORIGIN}/api/v1`;
}

export const SITE_OG_IMAGE = `${SITE_URL}/teacherspoints-logo.png`;
export const CONTACT_EMAIL = "hello@teacherpoint.org";
export const SUPPORT_EMAIL = "support@teacherpoint.org";

export const TWITTER_HANDLE = "@teacherpoint";
export const SOCIAL_LINKS = {
  twitter: "https://twitter.com/teacherpoint",
  facebook: "https://www.facebook.com/teacherpoint",
  linkedin: "https://www.linkedin.com/company/teacherpoint",
  instagram: "https://www.instagram.com/teacherpoint",
} as const;

export const DEFAULT_PAGE_TITLE = `${SITE_NAME} — ${SITE_TAGLINE}`;

export function pageTitle(suffix: string) {
  return `${suffix} · ${SITE_NAME}`;
}

export function absoluteUrl(path = "/"): string {
  if (!path || path === "/") return SITE_URL;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** @deprecated Use absoluteUrl — kept for existing imports. */
export const canonicalUrl = absoluteUrl;
