"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import type { ReactNode } from "react";
import {
  GOOGLE_OAUTH_CLIENT_ID,
  GOOGLE_SIGNIN_CONFIG_ERROR,
  isGoogleAuthConfigured,
  maskGoogleClientId,
} from "@/config/google-oauth";

export { isGoogleAuthConfigured, GOOGLE_SIGNIN_CONFIG_ERROR };

export function GoogleAuthProvider({ children }: { children: ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ?? "";

  if (!isGoogleAuthConfigured()) {
    if (process.env.NODE_ENV === 'production') {
      console.error("[google-oauth]", GOOGLE_SIGNIN_CONFIG_ERROR, {
        envPresent: Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID),
      });
    }
    return children;
  }

  if (process.env.NODE_ENV === 'development') {
    console.info("[google-oauth] GoogleOAuthProvider clientId:", maskGoogleClientId(clientId));
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_OAUTH_CLIENT_ID || clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
