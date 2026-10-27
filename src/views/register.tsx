"use client";

import { Link, useSearch } from "@/lib/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthDivider, GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { EmailOtpAuthForm } from "@/components/auth/EmailOtpAuthForm";
import { BrandLogo } from "@/components/BrandLogo";
import { isGoogleAuthConfigured } from "@/components/auth/GoogleAuthProvider";
import { useGoogleAuth } from "@/hooks/use-google-auth";
import { useTranslation } from "react-i18next";

function Register() {
  const { t } = useTranslation();
  const { role: roleParam } = useSearch<{ role?: "student" | "teacher" | "parent" }>();
  const role =
    roleParam === "student" || roleParam === "teacher" || roleParam === "parent" ? roleParam : undefined;
  const { googleLoading, googleError, handleGoogleSuccess, handleGoogleError } = useGoogleAuth({
    role,
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const showGoogle = isGoogleAuthConfigured();
  const roleLabel =
    role === "teacher" ? "tutor" : role === "parent" ? "parent" : role === "student" ? "student" : "member";

  if (!role) {
    return (
      <section className="container mx-auto max-w-lg px-4 py-16 text-center">
        <BrandLogo size="login" className="mx-auto mb-6" />
        <h1 className="font-display text-2xl font-bold">{t("register.chooseRoleTitle")}</h1>
        <p className="mt-2 text-muted-foreground">{t("register.chooseRoleSubtitle")}</p>
        <Button className="mt-6" asChild>
          <Link to="/role-select">{t("register.selectRole")}</Link>
        </Button>
      </section>
    );
  }

  return (
    <section className="container mx-auto grid max-w-6xl items-center gap-8 px-4 py-6 lg:grid-cols-2 lg:gap-12 lg:py-8">
      <div className="hidden lg:block">
        <BrandLogo size="login" className="mb-5" />
        <h1 className="font-display text-4xl font-extrabold leading-tight">{t("register.joinTitle")}</h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          {t("register.joinSubtitleOtp", "Create your free {{role}} account in seconds — use Google or a one-time email code.", {
            role: roleLabel,
          })}
        </p>
        <p className="mt-4 max-w-md rounded-xl border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          {role === "teacher"
            ? t("register.hintTeacher")
            : role === "parent"
              ? t("register.hintParent")
              : t("register.hintStudent")}
        </p>
      </div>

      <div className="mx-auto w-full max-w-lg">
        <div className="mb-4 flex justify-center lg:hidden">
          <BrandLogo size="login" />
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-soft sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <h2 className="font-display text-xl font-bold sm:text-2xl">{t("register.title")}</h2>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold capitalize text-foreground">
                {t("register.asRole", { role: roleLabel })}
              </span>{" "}
              ·{" "}
              <Link to="/role-select" className="font-semibold text-primary">
                {t("register.change")}
              </Link>
            </p>
          </div>

          {googleError ? (
            <p className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {googleError}
            </p>
          ) : null}

          {showGoogle ? (
            <div className="relative z-[2] mt-4">
              <GoogleSignInButton
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                disabled={googleLoading}
                loading={googleLoading}
                label={t("register.google", { role: roleLabel })}
              />
              <AuthDivider label={t("register.orEmail")} className="my-4" />
            </div>
          ) : null}

          <label className="mt-4 flex items-start gap-2 text-xs text-muted-foreground select-none">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-primary"
            />
            <Link to="/terms" className="hover:underline">
              {t("register.agree", { role: roleLabel })}
            </Link>
          </label>

          <EmailOtpAuthForm
            mode="signup"
            role={role}
            disabled={googleLoading}
            requireTerms
            termsAccepted={termsAccepted}
          />

          <p className="mt-4 text-center text-xs text-muted-foreground sm:text-sm">
            {t("register.haveAccount")}{" "}
            <Link to="/login" className="font-semibold text-primary">
              {t("register.login")}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default Register;
