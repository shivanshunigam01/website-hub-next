"use client";

import { Link, useNavigate, useSearch } from "@/lib/navigation";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, GraduationCap, BookOpen, Users, Shield } from "lucide-react";
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
import { useTranslation } from "react-i18next";

export type LoginPortal = "student" | "teacher" | "parent" | "admin";

const PORTAL_COPY: Record<
  LoginPortal,
  { title: string; subtitle: string; registerRole?: "student" | "teacher" | "parent"; icon: typeof BookOpen }
> = {
  student: {
    title: "Student log in",
    subtitle: "Access your courses, tutors, and learning dashboard.",
    registerRole: "student",
    icon: GraduationCap,
  },
  teacher: {
    title: "Tutor log in",
    subtitle: "Manage jobs, connections, and your teaching profile.",
    registerRole: "teacher",
    icon: BookOpen,
  },
  parent: {
    title: "Parent log in",
    subtitle: "Follow your child's tutors, posts, and sessions.",
    registerRole: "parent",
    icon: Users,
  },
  admin: {
    title: "Staff console",
    subtitle: "Admin access only. Not linked from the public site.",
    icon: Shield,
  },
};

export function RoleLoginForm({ portal }: { portal: LoginPortal }) {
  const { t } = useTranslation();
  const { loginWithPassword } = useApp();
  const nav = useNavigate();
  const { redirect } = useSearch<{ redirect?: string }>();
  const copy = PORTAL_COPY[portal];
  const isAdmin = portal === "admin";
  const publicRole = portal === "admin" ? undefined : portal;

  const { googleLoading, googleError, handleGoogleSuccess, handleGoogleError } = useGoogleAuth({
    role: publicRole,
    expectedRole: publicRole,
    redirect,
  });
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showSignUpHint, setShowSignUpHint] = useState(false);
  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const showGoogle = !isAdmin && isGoogleAuthConfigured();
  const Icon = copy.icon;

  return (
    <section className="container mx-auto grid max-w-6xl items-center gap-12 px-4 py-12 lg:grid-cols-2">
      <div className="hidden lg:block">
        <BrandLogo size="login" className="mb-6" />
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <h1 className="font-display text-4xl font-extrabold leading-tight">{copy.title}</h1>
        <p className="mt-4 max-w-md text-muted-foreground">{copy.subtitle}</p>
        {!isAdmin ? (
          <p className="mt-6 text-sm text-muted-foreground">
            Wrong portal?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Choose Student, Tutor, or Parent
            </Link>
          </p>
        ) : null}
      </div>

      <div className="mx-auto w-full max-w-md rounded-2xl border bg-card p-5 shadow-soft sm:p-6">
        <div className="mb-6 lg:hidden">
          <BrandLogo size="login" className="mb-4" />
        </div>

        <h2 className="font-display text-2xl font-bold">{copy.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {isAdmin ? (
            copy.subtitle
          ) : (
            <>
              {t("login.newHere")}{" "}
              <Link
                to="/register"
                search={{ role: copy.registerRole }}
                className="font-semibold text-primary"
              >
                {t("login.createAccount")}
              </Link>
            </>
          )}
        </p>

        {formError || googleError ? (
          <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <p>{formError || googleError}</p>
            {showSignUpHint && !isAdmin ? (
              <p className="mt-2 text-foreground">
                <Link
                  to="/register"
                  search={{ role: copy.registerRole }}
                  className="font-semibold text-primary hover:underline"
                >
                  {t("login.createAccountArrow", "Create an account →")}
                </Link>
              </p>
            ) : null}
          </div>
        ) : null}

        {!isAdmin && showGoogle ? (
          <div className="relative z-[2] mt-6 space-y-3">
            <GoogleSignInButton
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              disabled={submitting}
              loading={googleLoading}
              label={t("login.google")}
            />
            <p className="text-center text-xs text-muted-foreground">{t("login.googleHint")}</p>

            <WhatsAppAuthButton
              onClick={() => setWhatsappOpen(true)}
              disabled={submitting || googleLoading}
              label={t("login.whatsapp")}
            />

            <AuthDivider label={t("login.orEmail")} />
          </div>
        ) : null}

        {!isAdmin && !showGoogle ? (
          <div className="mt-4 space-y-3">
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
              {GOOGLE_SIGNIN_CONFIG_ERROR}
            </p>
            <WhatsAppAuthButton
              onClick={() => setWhatsappOpen(true)}
              disabled={submitting}
              label={t("login.whatsapp")}
            />
            <AuthDivider label={t("login.orEmail")} />
          </div>
        ) : null}

        <form
          className={`space-y-4 ${isAdmin || (!showGoogle && isAdmin) ? "mt-6" : ""} ${isAdmin ? "mt-6" : ""}`}
          onSubmit={(e) => {
            void (async () => {
              e.preventDefault();
              setFormError(null);
              setShowSignUpHint(false);
              const fd = new FormData(e.currentTarget);
              const email = String(fd.get("email") ?? "").trim();
              const password = String(fd.get("password") ?? "");

              setSubmitting(true);
              try {
                const session = await loginWithPassword(email, password, portal);

                setFormError(null);
                toast.success(
                  t("login.welcomeToast", "Welcome back, {{name}}!", { name: session.user.name }),
                );

                const destination =
                  redirect ||
                  afterAuthPath(
                    session.user.role,
                    session.profileComplete,
                    session.user.isVerified !== false,
                  );
                await navigateAfterAuth(nav, redirect || undefined, destination);
              } catch (err) {
                const notRegistered = isAccountNotRegisteredError(err);
                const message = formatApiErrorMessage(
                  err,
                  notRegistered ? t("login.notRegistered") : t("login.failed"),
                );
                setFormError(message);
                setShowSignUpHint(notRegistered && !isAdmin);
                toast.error(message, { duration: 5000 });
              } finally {
                setSubmitting(false);
              }
            })();
          }}
        >
          <div>
            <Label htmlFor="email">{t("login.email")}</Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder={t("login.emailPlaceholder")}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="pwd">{t("login.password")}</Label>
              {!isAdmin ? (
                <Link to="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
                  {t("login.forgot")}
                </Link>
              ) : null}
            </div>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                aria-label={t("login.togglePassword", "Toggle password")}
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
            {submitting ? t("login.signingIn") : isAdmin ? "Sign in to console" : t("login.submit")}
          </Button>
        </form>

        {!isAdmin ? (
          <WhatsAppAuthModal
            open={whatsappOpen}
            onOpenChange={setWhatsappOpen}
            mode="login"
            defaultRole={publicRole}
            expectedRole={publicRole}
            redirect={redirect}
          />
        ) : null}
      </div>
    </section>
  );
}

export default RoleLoginForm;
