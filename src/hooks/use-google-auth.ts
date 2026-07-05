"use client";

import { useState } from "react";
import { useNavigate } from "@/lib/navigation";
import type { CredentialResponse } from "@react-oauth/google";
import { toast } from "sonner";
import { useApp } from "@/hooks/use-app";
import { afterAuthPath, navigateAfterAuth } from "@/lib/auth-redirect";
import { formatApiErrorMessage } from "@/lib/api";
import { GOOGLE_SIGNIN_CONFIG_ERROR, isGoogleAuthConfigured } from "@/config/google-oauth";

type UseGoogleAuthOptions = {
  role?: "student" | "teacher";
  /** After sign-in, go here instead of the default dashboard path */
  redirect?: string;
};

export function useGoogleAuth(options: UseGoogleAuthOptions = {}) {
  const { role, redirect } = options;
  const { loginWithGoogle } = useApp();
  const nav = useNavigate();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const completeGoogleSignIn = async (credential: string) => {
    setGoogleError(null);
    setGoogleLoading(true);
    try {
      const session = await loginWithGoogle(credential, role);
      toast.success(`Welcome${session.user.name ? `, ${session.user.name}` : ""}!`);
      if (session.welcomeEmailSent) {
        toast.success("Welcome email with course highlights sent to your inbox.", {
          duration: 7000,
        });
      }
      const destination =
        redirect ||
        afterAuthPath(
          session.user.role,
          session.profileComplete,
          session.user.isVerified !== false,
        );
      await navigateAfterAuth(nav, redirect || undefined, destination);
    } catch (err) {
      const message = formatApiErrorMessage(err, "Google sign-in failed. Please try again.");
      setGoogleError(message);
      toast.error(message, { duration: 6000 });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      const message = "Google sign-in did not return a credential.";
      setGoogleError(message);
      toast.error(message);
      return;
    }
    await completeGoogleSignIn(credentialResponse.credential);
  };

  const handleGoogleError = () => {
    const message = isGoogleAuthConfigured()
      ? "Google sign-in was cancelled or failed. If you see Error 401 invalid_client, verify NEXT_PUBLIC_GOOGLE_CLIENT_ID matches Google Cloud Console."
      : GOOGLE_SIGNIN_CONFIG_ERROR;
    setGoogleError(message);
    toast.error(message, { duration: 8000 });
    if (process.env.NEXT_PUBLIC_API_DEBUG === "true") {
      console.error("[google-auth] GoogleLogin onError", {
        configured: isGoogleAuthConfigured(),
        clientIdSuffix: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.slice(-24),
      });
    }
  };

  return {
    googleLoading,
    googleError,
    setGoogleError,
    handleGoogleSuccess,
    handleGoogleError,
  };
}
