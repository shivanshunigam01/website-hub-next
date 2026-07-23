"use client";

import { Link, useNavigate, useSearch } from "@/lib/navigation";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandLogo } from "@/components/BrandLogo";
import { AuthDivider, GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { WhatsAppAuthButton } from "@/components/auth/WhatsAppAuthButton";
import { WhatsAppAuthModal } from "@/components/auth/WhatsAppAuthModal";
import { isGoogleAuthConfigured, GOOGLE_SIGNIN_CONFIG_ERROR } from "@/config/google-oauth";
import { useApp } from "@/hooks/use-app";
import { useGoogleAuth } from "@/hooks/use-google-auth";
import { afterAuthPath, navigateAfterAuth } from "@/lib/auth-redirect";
import { formatApiErrorMessage, isAccountNotRegisteredError } from "@/lib/api";
import { toast } from "sonner";

function Login() {
  const { loginWithPassword } = useApp();
  const nav = useNavigate();
  const { redirect } = useSearch<{ redirect?: string }>();
  const { googleLoading, googleError, handleGoogleSuccess, handleGoogleError } = useGoogleAuth({
    redirect,
  });
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showSignUpHint, setShowSignUpHint] = useState(false);
  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const showGoogle = isGoogleAuthConfigured();

  return (
    <section className="container mx-auto px-4 py-12 grid lg:grid-cols-2 gap-12 items-center max-w-6xl">
      <div className="hidden lg:block">
        <BrandLogo size="login" className="mb-6" />
        <h1 className="font-display font-extrabold text-4xl leading-tight">
          Welcome back to <span className="text-gradient-primary">TeacherPoint</span>
        </h1>
        <p className="mt-4 text-muted-foreground max-w-md">
          Sign in with Google for one-tap access, or use your email and password. Students, tutors,
          and parents use the same login page.
        </p>
      </div>

      <div className="bg-card border rounded-2xl p-8 shadow-soft max-w-md w-full mx-auto">
        <div className="mb-6 lg:hidden">
          <BrandLogo size="login" className="mb-4" />
        </div>

        <h2 className="font-display font-bold text-2xl">Log in</h2>
        <p className="text-sm text-muted-foreground mt-1">
          New here?{" "}
          <Link to="/role-select" className="text-primary font-semibold">
            Create an account
          </Link>
        </p>

        {formError || googleError ? (
          <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <p>{formError || googleError}</p>
            {showSignUpHint ? (
              <p className="mt-2 text-foreground">
                <Link to="/role-select" className="font-semibold text-primary hover:underline">
                  Create an account →
                </Link>
              </p>
            ) : null}
          </div>
        ) : null}

        {showGoogle ? (
          <div className="relative z-[2] mt-6 space-y-3">
            <GoogleSignInButton
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              disabled={submitting}
              loading={googleLoading}
              label="Sign in with Google"
            />
            <p className="text-center text-xs text-muted-foreground">
              Fastest way to sign in — uses your Google account
            </p>

            <WhatsAppAuthButton
              onClick={() => setWhatsappOpen(true)}
              disabled={submitting || googleLoading}
              label="Continue with WhatsApp"
            />

            <AuthDivider label="or sign in with email" />
          </div>
        ) : (
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
            {GOOGLE_SIGNIN_CONFIG_ERROR} Set{" "}
            <code className="font-mono">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code>
            {process.env.NODE_ENV === 'production' ? (
              <>
                {" "}
                in your hosting provider (e.g. Vercel → Environment Variables), then redeploy without
                build cache.
              </>
            ) : (
              <>
                {" "}
                in <code className="font-mono">website-hub/.env</code> and restart the dev server.
              </>
            )}
          </p>
        )}

        {!showGoogle ? (
          <div className="mt-4 space-y-3">
            <WhatsAppAuthButton
              onClick={() => setWhatsappOpen(true)}
              disabled={submitting}
              label="Continue with WhatsApp"
            />
            <AuthDivider label="or sign in with email" />
          </div>
        ) : null}

        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setFormError(null);
            setShowSignUpHint(false);
            const fd = new FormData(e.currentTarget);
            const email = String(fd.get("email") ?? "").trim();
            const password = String(fd.get("password") ?? "");

            setSubmitting(true);
            try {
              const session = await loginWithPassword(email, password);

              setFormError(null);
              toast.success(`Welcome back, ${session.user.name}!`);

              const destination =
                redirect ||
                afterAuthPath(
                  session.user.role,
                  session.profileComplete,
                  session.user.isVerified !== false,
                );
              await navigateAfterAuth(nav, redirect || undefined, destination);
            } catch (err) {
              if (process.env.NEXT_PUBLIC_API_DEBUG === "true") {
                console.error("[login] failed", err);
              }

              const notRegistered = isAccountNotRegisteredError(err);
              const message = formatApiErrorMessage(
                err,
                notRegistered
                  ? "Your account has not been registered yet. Please sign up to continue."
                  : "Login failed. Please try again.",
              );
              setFormError(message);
              setShowSignUpHint(notRegistered);
              toast.error(message, { duration: 5000 });
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <div>
            <Label htmlFor="email">Email</Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@email.com"
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="pwd">Password</Label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="pwd"
                name="password"
                type={show ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-label="Toggle password"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button
            type="submit"
            size="lg"
            variant="gradient"
            className="w-full"
            disabled={submitting || googleLoading}
          >
            {submitting ? "Signing in…" : "Log in with email"}
          </Button>
        </form>

        <WhatsAppAuthModal
          open={whatsappOpen}
          onOpenChange={setWhatsappOpen}
          mode="login"
          redirect={redirect}
        />
      </div>
    </section>
  );
}

export default Login;
