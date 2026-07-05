/**
 * Google OAuth Web client ID — public in the browser bundle (not a secret).
 */
export const GOOGLE_OAUTH_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ?? "";

export const GOOGLE_SIGNIN_CONFIG_ERROR =
  "Google Sign-In configuration error. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID and redeploy the frontend.";

export function isGoogleAuthConfigured(): boolean {
  return (
    GOOGLE_OAUTH_CLIENT_ID.length > 0 &&
    GOOGLE_OAUTH_CLIENT_ID.endsWith(".apps.googleusercontent.com")
  );
}

export function maskGoogleClientId(id: string): string {
  if (!id) return "(not set)";
  if (id.length < 24) return "(invalid format)";
  return `${id.slice(0, 12)}...${id.slice(-24)}`;
}
