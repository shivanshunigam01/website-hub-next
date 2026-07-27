"use client";

import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "@/lib/navigation";
import { Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { PhoneNumberField } from "@/components/PhoneNumberField";
import { findPhoneCountryByCode } from "@/lib/phone-codes";
import { useApp } from "@/hooks/use-app";
import { afterAuthPath } from "@/lib/auth-redirect";
import { formatApiErrorMessage } from "@/lib/api";
import { formatCooldown, parseOtpCooldown } from "@/lib/otp-cooldown";
import { parseE164Digits } from "@/lib/phone-codes";
import { persistWhatsappVerifiedPhone } from "@/lib/whatsapp-verified-phone";
import {
  formatPhoneForApi,
  loginWithWhatsapp,
  sendWhatsappOtp,
  signupWithWhatsapp,
  verifyWhatsappOtp,
} from "@/services/whatsapp-auth-api";
import type { WhatsappOtpPurpose } from "@/types/whatsapp-auth";

const RESEND_SECONDS = 60;

type Step = "details" | "otp";

export type WhatsAppAuthModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "login" | "signup";
  /** Signup role from /register?role= */
  defaultRole?: "student" | "teacher" | "parent";
  /** Login portal gate — rejects accounts with a different role */
  expectedRole?: "student" | "teacher" | "parent";
  redirect?: string;
};

export function WhatsAppAuthModal({
  open,
  onOpenChange,
  mode,
  defaultRole = "student",
  expectedRole,
  redirect,
}: WhatsAppAuthModalProps) {
  const nav = useNavigate();
  const { setWhatsappSession } = useApp();

  const [step, setStep] = useState<Step>("details");
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneLocal, setPhoneLocal] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"student" | "teacher" | "parent">(defaultRole);
  const [otp, setOtp] = useState("");
  const [phoneE164, setPhoneE164] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const purpose: WhatsappOtpPurpose = mode;

  const reset = useCallback(() => {
    setStep("details");
    setPhoneLocal("");
    setOtp("");
    setPhoneE164("");
    setSending(false);
    setVerifying(false);
    setCountdown(0);
    setNotice(null);
    setError(null);
    if (mode === "signup") {
      setName("");
      setRole(defaultRole);
    }
  }, [mode, defaultRole]);

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  useEffect(() => {
    if (countdown <= 0) {
      setNotice(null);
      return;
    }
    const t = window.setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [countdown]);

  const validatePhone = () => {
    const digits = phoneLocal.replace(/\D/g, "");
    const ccDigits = countryCode.replace(/\D/g, "");
    const full = `${ccDigits}${digits}`;

    if (digits.length < 4) {
      toast.error("Enter your phone number");
      return null;
    }
    if (full.length < 8 || full.length > 15) {
      toast.error("Enter a valid phone number with country code");
      return null;
    }
    return formatPhoneForApi(countryCode, digits);
  };

  const handleSendOtp = async () => {
    if (mode === "signup" && name.trim().length < 2) {
      toast.error("Enter your full name");
      return;
    }
    const phone = validatePhone();
    if (!phone) return;

    setSending(true);
    setError(null);
    setNotice(null);
    try {
      const res = await sendWhatsappOtp(phone, purpose);
      setPhoneE164(res.phone || phone);
      setStep("otp");
      setCountdown(RESEND_SECONDS);
      setOtp("");
      if (res.devOtp) {
        toast.success(`Dev OTP: ${res.devOtp} (WhatsApp mock / local only)`);
        setOtp(res.devOtp);
      } else {
        toast.success("OTP sent on WhatsApp");
      }
    } catch (err) {
      const cooldown = parseOtpCooldown(err);
      if (cooldown?.kind === "resend") {
        // The previous code is still valid — let them type it instead of dead-ending.
        setPhoneE164(phone);
        setStep("otp");
        setOtp("");
        setCountdown(cooldown.seconds);
        setNotice(
          `${cooldown.message}. We already sent a code to this number — enter it below.`,
        );
        toast.info(cooldown.message);
        return;
      }
      if (cooldown?.kind === "lockout") {
        setCountdown(cooldown.seconds);
        setError(cooldown.message);
        toast.error(cooldown.message);
        return;
      }
      const message = formatApiErrorMessage(err, "Could not send OTP");
      setError(message);
      toast.error(message);
    } finally {
      setSending(false);
    }
  };

  const completeAuth = async () => {
    persistWhatsappVerifiedPhone(phoneE164);
    const waParsed = parseE164Digits(phoneE164);

    const withWhatsappPhone = (session: {
      user: { phone?: string; phoneCountryCode?: string; provider?: string };
      accessToken?: string;
      refreshToken?: string;
      profileComplete?: boolean;
      requiresEmailVerification?: boolean;
    }) => ({
      ...session,
      user: {
        ...session.user,
        provider: "whatsapp" as const,
        phone: session.user.phone?.trim() ? session.user.phone : waParsed.number,
        phoneCountryCode: session.user.phoneCountryCode || waParsed.countryCode,
      },
    });

    if (mode === "login") {
      const result = await loginWithWhatsapp(phoneE164, expectedRole);
      if ("newUser" in result && result.newUser) {
        onOpenChange(false);
        toast.info("No account found. Create one with WhatsApp.");
        await nav({ to: "/role-select" });
        return;
      }
      if (!result.accessToken || !result.user) {
        toast.error("Login failed. Please try again.");
        return;
      }
      const session = await setWhatsappSession(withWhatsappPhone(result) as typeof result);
      toast.success(`Welcome back, ${session.user.name}!`);
      const destination =
        redirect ||
        afterAuthPath(session.user.role, session.profileComplete, session.user.isVerified !== false);
      onOpenChange(false);
      await nav({ to: destination });
      return;
    }

    const session = await setWhatsappSession(
      withWhatsappPhone(
        await signupWithWhatsapp({ name: name.trim(), phone: phoneE164, role }),
      ) as Awaited<ReturnType<typeof signupWithWhatsapp>>,
    );
    toast.success(`Welcome, ${session.user.name}!`);
    onOpenChange(false);
    await nav({
      to: afterAuthPath(session.user.role, session.profileComplete, true),
    });
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error("Enter the 6-digit code");
      return;
    }
    setVerifying(true);
    setError(null);
    try {
      await verifyWhatsappOtp(phoneE164, otp, purpose);
      await completeAuth();
    } catch (err) {
      const message = formatApiErrorMessage(err, "Verification failed");
      setError(message);
      toast.error(message);
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || !phoneE164) return;
    setSending(true);
    setError(null);
    setNotice(null);
    try {
      const res = await sendWhatsappOtp(phoneE164, purpose);
      setCountdown(RESEND_SECONDS);
      setOtp("");
      if (res.devOtp) {
        toast.success(`Dev OTP: ${res.devOtp} (WhatsApp mock / local only)`);
        setOtp(res.devOtp);
      } else {
        toast.success("OTP resent on WhatsApp");
      }
    } catch (err) {
      const cooldown = parseOtpCooldown(err);
      if (cooldown) {
        setCountdown(cooldown.seconds);
        if (cooldown.kind === "lockout") {
          setError(cooldown.message);
          toast.error(cooldown.message);
        } else {
          setNotice(cooldown.message);
          toast.info(cooldown.message);
        }
        return;
      }
      const message = formatApiErrorMessage(err, "Could not resend OTP");
      setError(message);
      toast.error(message);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border/80 bg-card">
        {step === "details" ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-display">
                {mode === "login" ? "Log in with WhatsApp" : "Sign up with WhatsApp"}
              </DialogTitle>
              <DialogDescription>
                {mode === "login"
                  ? "We will send a one-time code to your WhatsApp number."
                  : "Create your account using WhatsApp verification."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              {mode === "signup" ? (
                <>
                  <div>
                    <Label htmlFor="wa-name">Full name</Label>
                    <Input
                      id="wa-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="mt-1"
                      autoComplete="name"
                    />
                  </div>
                  <div>
                    <Label>Role</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(
                        [
                          { id: "student" as const, label: "Student" },
                          { id: "teacher" as const, label: "Tutor" },
                          { id: "parent" as const, label: "Parent" },
                        ] as const
                      ).map((r) => (
                        <label
                          key={r.id}
                          className={`flex min-w-[5.5rem] flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                            role === r.id
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border hover:bg-muted/50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="wa-role"
                            className="sr-only"
                            checked={role === r.id}
                            onChange={() => setRole(r.id)}
                          />
                          {r.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}

              <PhoneNumberField
                id="wa-phone"
                label="Phone number"
                countryCode={countryCode}
                onCountryCodeChange={setCountryCode}
                phoneNumber={phoneLocal}
                onPhoneNumberChange={setPhoneLocal}
                placeholder={
                  countryCode === "+91" ? "9876543210" : "Phone number"
                }
                autoDetectCountry
                userHasSavedPhone={false}
              />

              {error ? (
                <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              ) : null}

              <Button
                type="button"
                variant="gradient"
                className="w-full"
                disabled={sending || countdown > 0}
                onClick={handleSendOtp}
              >
                {sending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending…
                  </>
                ) : countdown > 0 ? (
                  `Try again in ${formatCooldown(countdown)}`
                ) : (
                  "Continue"
                )}
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display">Verify WhatsApp</DialogTitle>
              <DialogDescription>
                We sent a verification code on WhatsApp to{" "}
                <span className="font-medium text-foreground">
                  {findPhoneCountryByCode(countryCode)?.code ?? countryCode} {phoneLocal}
                </span>
                .
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 pt-2">
              {notice ? (
                <p className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{notice}</span>
                </p>
              ) : null}

              {error ? (
                <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              ) : null}

              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <InputOTPSlot key={i} index={i} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                type="button"
                variant="gradient"
                className="w-full"
                disabled={verifying || otp.length !== 6}
                onClick={handleVerifyOtp}
              >
                {verifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying…
                  </>
                ) : (
                  "Verify & continue"
                )}
              </Button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setError(null);
                    setNotice(null);
                    // Cooldowns are per-number, so a new number starts clean.
                    setCountdown(0);
                    setStep("details");
                  }}
                >
                  ← Change number
                </button>
                <button
                  type="button"
                  className="font-semibold text-primary disabled:opacity-40"
                  disabled={countdown > 0 || sending}
                  onClick={handleResend}
                >
                  {countdown > 0
                    ? `Resend in ${formatCooldown(countdown)}`
                    : sending
                      ? "Sending…"
                      : "Resend OTP"}
                </button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
