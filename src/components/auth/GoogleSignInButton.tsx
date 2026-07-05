"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { isGoogleAuthConfigured } from "@/components/auth/GoogleAuthProvider";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

type GoogleSignInButtonProps = {
  onSuccess: (response: CredentialResponse) => void | Promise<void>;
  onError?: () => void;
  /** Blocks interaction (e.g. while email form is submitting) */
  disabled?: boolean;
  /** Shows loading overlay but keeps Google iframe mounted */
  loading?: boolean;
  label?: string;
  className?: string;
};

export function GoogleSignInButton({
  onSuccess,
  onError,
  disabled = false,
  loading = false,
  label = "Continue with Google",
  className,
}: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [btnWidth, setBtnWidth] = useState(320);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const w = el.getBoundingClientRect().width;
      if (w > 0) setBtnWidth(Math.max(280, Math.floor(w)));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (!isGoogleAuthConfigured()) {
    return null;
  }

  const blocked = disabled;

  return (
    <div
      ref={containerRef}
      className={cn("relative isolate z-[1] w-full", className)}
    >
      {/* Custom appearance (not clickable) */}
      <div
        className={cn(
          "pointer-events-none flex h-11 w-full items-center justify-center gap-3 rounded-md border border-border bg-background px-4 text-sm font-semibold text-foreground shadow-sm",
          (blocked || loading) && "opacity-70",
        )}
        aria-hidden="true"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : (
          <GoogleIcon className="h-5 w-5 shrink-0" />
        )}
        <span>{loading ? "Signing in with Google…" : label}</span>
      </div>

      {/* Real Google button — full-size transparent click target */}
      {!blocked ? (
        <div
          className={cn(
            "absolute inset-0 z-20 cursor-pointer opacity-0",
            "pointer-events-auto",
            "[&>div]:!h-full [&>div]:!w-full",
            "[&_iframe]:!min-h-[44px] [&_iframe]:!h-[44px] [&_iframe]:!w-full [&_iframe]:!max-w-none",
          )}
          role="button"
          aria-label={label}
          tabIndex={loading ? -1 : 0}
        >
          <GoogleLogin
            onSuccess={onSuccess}
            onError={() => onError?.()}
            useOneTap={false}
            theme="outline"
            size="large"
            text="continue_with"
            shape="rectangular"
            width={btnWidth}
            containerProps={{
              style: {
                width: "100%",
                height: "100%",
                minHeight: 44,
                display: "flex",
                alignItems: "stretch",
                justifyContent: "center",
              },
            }}
          />
        </div>
      ) : null}

      {/* Loading / disabled shield */}
      {(loading || blocked) ? (
        <div
          className="absolute inset-0 z-30 rounded-xl bg-background/80 pointer-events-auto"
          aria-hidden="true"
        />
      ) : null}
    </div>
  );
}

export function AuthDivider({ label = "or continue with email", className }: { label?: string; className?: string }) {
  return (
    <div className={cn("relative my-6", className)}>
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center text-xs tracking-wide">
        <span className="bg-card px-3 text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}
