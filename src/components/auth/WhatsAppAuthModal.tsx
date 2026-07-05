"use client";

import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "@/lib/navigation";
import { Loader2 } from "lucide-react";
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
  defaultRole?: "student" | "teacher";
  redirect?: string;
};

export function WhatsAppAuthModal({
  open,
  onOpenChange,
  mode,
  defaultRole = "student",
  redirect,
}: WhatsAppAuthModalProps) {
  const nav = useNavigate();
  const { setWhatsappSession } = useApp();

  const [step, setStep] = useState<Step>("details");
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneLocal, setPhoneLocal] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"student" | "teacher">(defaultRole);
  const [otp, setOtp] = useState("");
  const [phoneE164, setPhoneE164] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const purpose: WhatsappOtpPurpose = mode;

  const reset = useCallback(() => {
    setStep("details");
    setPhoneLocal("");
    setOtp("");
    setPhoneE164("");
    setSending(false);
    setVerifying(false);
    setCountdown(0);
    if (mode === "signup") {
      setName("");
      setRole(defaultRole);
    }
  }, [mode, defaultRole]);

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  useEffect(() => {
    if (countdown <= 0) return;
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
    try {
      const res = await sendWhatsappOtp(phone, purpose);
      setPhoneE164(res.phone || phone);
      setStep("otp");
      setCountdown(RESEND_SECONDS);
      setOtp("");
      toast.success("OTP sent on WhatsApp");
    } catch (err) {
      toast.error(formatApiErrorMessage(err, "Could not send OTP"));
    } finally {
      setSending(false);
    }
  };

  const completeAuth = async () => {
    if (mode === "login") {
      const result = await loginWithWhatsapp(phoneE164);
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
      const session = await setWhatsappSession(result);
      toast.success(`Welcome back, ${session.user.name}!`);
      const destination =
        redirect ||
        afterAuthPath(session.user.role, session.profileComplete, session.user.isVerified !== false);
      onOpenChange(false);
      await nav({ to: destination });
      return;
    }

    const session = await setWhatsappSession(
      await signupWithWhatsapp({ name: name.trim(), phone: phoneE164, role }),
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
    try {
      await verifyWhatsappOtp(phoneE164, otp, purpose);
      await completeAuth();
    } catch (err) {
      toast.error(formatApiErrorMessage(err, "Verification failed"));
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || !phoneE164) return;
    setSending(true);
    try {
      const res = await sendWhatsappOtp(phoneE164, purpose);
      setCountdown(RESEND_SECONDS);
      toast.success("OTP resent on WhatsApp");
    } catch (err) {
      toast.error(formatApiErrorMessage(err, "Could not resend OTP"));
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
                    <div className="mt-2 flex gap-3">
                      {(["student", "teacher"] as const).map((r) => (
                        <label
                          key={r}
                          className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                            role === r
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border hover:bg-muted/50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="wa-role"
                            className="sr-only"
                            checked={role === r}
                            onChange={() => setRole(r)}
                          />
                          {r === "teacher" ? "Tutor" : "Student"}
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

              <Button
                type="button"
                variant="gradient"
                className="w-full"
                disabled={sending}
                onClick={handleSendOtp}
              >
                {sending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending…
                  </>
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
                  onClick={() => setStep("details")}
                >
                  ← Change number
                </button>
                <button
                  type="button"
                  className="font-semibold text-primary disabled:opacity-40"
                  disabled={countdown > 0 || sending}
                  onClick={handleResend}
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : sending ? "Sending…" : "Resend OTP"}
                </button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
