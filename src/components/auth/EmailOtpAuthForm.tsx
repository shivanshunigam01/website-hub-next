"use client";

import { useCallback, useEffect, useState } from "react";
import { Clock, Loader2, Mail, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useApp } from "@/hooks/use-app";
import { afterAuthPath, navigateAfterAuth } from "@/lib/auth-redirect";
import { formatApiErrorMessage, isAccountNotRegisteredError } from "@/lib/api";
import { formatCooldown } from "@/lib/otp-cooldown";
import { sendEmailAuthOtp, verifyEmailAuthOtp } from "@/services/email-otp-auth-api";
import { useNavigate } from "@/lib/navigation";
import { useTranslation } from "react-i18next";

const RESEND_SECONDS = 60;

type Step = "details" | "otp";

export type EmailOtpAuthFormProps = {
  mode: "login" | "signup";
  role?: "student" | "teacher" | "parent";
  expectedRole?: "student" | "teacher" | "parent";
  redirect?: string;
  disabled?: boolean;
  /** When true, user must accept terms before sending a sign-up code */
  requireTerms?: boolean;
  termsAccepted?: boolean;
};

export function EmailOtpAuthForm({
  mode,
  role,
  expectedRole,
  redirect,
  disabled,
  requireTerms,
  termsAccepted,
}: EmailOtpAuthFormProps) {
  const { t } = useTranslation();
  const nav = useNavigate();
  const { setEmailOtpSession } = useApp();

  const [step, setStep] = useState<Step>("details");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showSignUpHint, setShowSignUpHint] = useState(false);

  const purpose = mode;

  useEffect(() => {
    if (countdown <= 0) return;
    const id = window.setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => window.clearInterval(id);
  }, [countdown]);

  const handleSend = useCallback(async () => {
    setError(null);
    setShowSignUpHint(false);
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError(t("emailOtp.emailRequired", "Enter your email address."));
      return;
    }
    if (mode === "signup" && name.trim().length < 2) {
      setError(t("emailOtp.nameRequired", "Enter your full name."));
      return;
    }
    if (mode === "signup" && !role) {
      setError(t("emailOtp.roleRequired", "Choose a role before signing up."));
      return;
    }
    if (requireTerms && !termsAccepted) {
      setError(t("register.termsRequired", "Please accept the terms to continue."));
      return;
    }

    setSending(true);
    try {
      const result = await sendEmailAuthOtp({
        email: trimmedEmail,
        purpose,
        ...(mode === "signup" ? { name: name.trim(), role } : {}),
      });
      setStep("otp");
      setCountdown(RESEND_SECONDS);
      toast.success(
        t("emailOtp.sent", "We sent a 6-digit code to {{email}}.", { email: trimmedEmail }),
        { duration: 6000 },
      );
      if (result.devOtp) {
        toast.message(t("emailOtp.devOtp", "Dev code: {{otp}}", { otp: result.devOtp }), { duration: 12000 });
      }
    } catch (err) {
      const notRegistered = mode === "login" && isAccountNotRegisteredError(err);
      const message = formatApiErrorMessage(
        err,
        notRegistered ? t("login.notRegistered") : t("emailOtp.sendFailed", "Could not send code."),
      );
      setError(message);
      setShowSignUpHint(notRegistered);
      toast.error(message);
    } finally {
      setSending(false);
    }
  }, [email, mode, name, purpose, role, t]);

  const handleVerify = useCallback(async () => {
    setError(null);
    if (otp.length !== 6) {
      setError(t("emailOtp.otpLength", "Enter the 6-digit code from your email."));
      return;
    }

    setVerifying(true);
    try {
      const data = await verifyEmailAuthOtp({
        email: email.trim().toLowerCase(),
        otp,
        purpose,
        ...(mode === "signup" ? { name: name.trim(), role } : {}),
        ...(expectedRole ? { expectedRole } : {}),
      });
      const session = await setEmailOtpSession(data);
      toast.success(
        mode === "signup"
          ? t("register.createdToast", "Account created — you are now signed in!")
          : t("login.welcomeToast", "Welcome back, {{name}}!", { name: session.user.name }),
      );
      const destination =
        redirect ||
        afterAuthPath(session.user.role, session.profileComplete, session.user.isVerified !== false);
      await navigateAfterAuth(nav, redirect || undefined, destination);
    } catch (err) {
      const message = formatApiErrorMessage(err, t("emailOtp.verifyFailed", "Invalid or expired code."));
      setError(message);
      toast.error(message);
    } finally {
      setVerifying(false);
    }
  }, [email, expectedRole, mode, name, nav, otp, purpose, redirect, role, setEmailOtpSession, t]);

  const handleResend = async () => {
    if (countdown > 0) return;
    await handleSend();
  };

  if (step === "otp") {
    return (
      <div className="space-y-4">
        {error ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
            {showSignUpHint ? (
              <span className="mt-2 block text-foreground">
                {t("login.createAccountArrow", "Create an account →")}
              </span>
            ) : null}
          </p>
        ) : null}

        <p className="text-sm text-muted-foreground">
          {t("emailOtp.enterCode", "Enter the code we sent to")}{" "}
          <span className="font-medium text-foreground">{email}</span>
          <button
            type="button"
            className="ml-2 text-xs font-semibold text-primary hover:underline"
            onClick={() => {
              setStep("details");
              setOtp("");
              setError(null);
            }}
          >
            {t("emailOtp.changeEmail", "Change")}
          </button>
        </p>

        <div className="flex justify-center">
          <InputOTP maxLength={6} value={otp} onChange={setOtp} disabled={verifying || disabled}>
            <InputOTPGroup>
              {Array.from({ length: 6 }).map((_, i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        <Button
          type="button"
          size="lg"
          variant="gradient"
          className="w-full"
          disabled={verifying || disabled || otp.length !== 6}
          onClick={() => void handleVerify()}
        >
          {verifying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("emailOtp.verifying", "Verifying…")}
            </>
          ) : mode === "signup" ? (
            t("emailOtp.verifySignup", "Create account")
          ) : (
            t("login.submit", "Sign in")
          )}
        </Button>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          {countdown > 0 ? (
            <span>{formatCooldown(countdown)}</span>
          ) : (
            <button type="button" className="font-semibold text-primary hover:underline" onClick={() => void handleResend()}>
              {t("emailOtp.resend", "Resend code")}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        void handleSend();
      }}
    >
      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {mode === "signup" ? (
        <div>
          <Label htmlFor="email-otp-name">{t("register.fullName")}</Label>
          <div className="relative mt-1">
            <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email-otp-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              className="pl-10"
              placeholder={t("register.namePlaceholder")}
              disabled={disabled || sending}
            />
          </div>
        </div>
      ) : null}

      <div>
        <Label htmlFor="email-otp-email">{t("login.email")}</Label>
        <div className="relative mt-1">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email-otp-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="pl-10"
            placeholder={t("login.emailPlaceholder")}
            disabled={disabled || sending}
          />
        </div>
      </div>

      <Button type="submit" size="lg" variant="gradient" className="w-full" disabled={disabled || sending}>
        {sending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("emailOtp.sending", "Sending code…")}
          </>
        ) : mode === "signup" ? (
          t("emailOtp.sendCodeSignup", "Email me a sign-up code")
        ) : (
          t("emailOtp.sendCode", "Email me a sign-in code")
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        {t("emailOtp.noPassword", "No password needed — we verify you with a one-time code.")}
      </p>
    </form>
  );
}
