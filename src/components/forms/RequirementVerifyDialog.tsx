"use client";

import { useEffect, useState } from "react";
import { Link } from "@/lib/navigation";
import { Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { formatApiErrorMessage } from "@/lib/api";
import { formatCooldown, parseOtpCooldown } from "@/lib/otp-cooldown";
import { formatPhoneForApi, sendWhatsappOtp, verifyWhatsappOtp } from "@/services/whatsapp-auth-api";
import type { WhatsappOtpPurpose } from "@/types/whatsapp-auth";
import { persistWhatsappVerifiedPhone } from "@/lib/whatsapp-verified-phone";

const RESEND_SECONDS = 60;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phoneCountryCode: string;
  phone: string;
  emailSent?: boolean;
  alreadyVerified?: boolean;
};

export function RequirementVerifyDialog({
  open,
  onOpenChange,
  phoneCountryCode,
  phone,
  emailSent,
  alreadyVerified,
}: Props) {
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(Boolean(alreadyVerified));
  const [countdown, setCountdown] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const e164 = formatPhoneForApi(phoneCountryCode, phone);
  const purpose: WhatsappOtpPurpose = "verify";

  useEffect(() => {
    if (countdown <= 0) {
      setNotice(null);
      return;
    }
    const t = window.setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [countdown]);

  const sendOtp = async () => {
    if (countdown > 0) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const res = await sendWhatsappOtp(e164, purpose);
      setSent(true);
      setOtp("");
      setCountdown(RESEND_SECONDS);
      if (res.devOtp) {
        toast.success(`Dev OTP: ${res.devOtp} (WhatsApp mock / local only)`);
        setOtp(res.devOtp);
      } else {
        toast.success("OTP sent on WhatsApp");
      }
    } catch (err) {
      const cooldown = parseOtpCooldown(err);
      if (cooldown?.kind === "resend") {
        // A code is already live for this number — show the OTP box, not a failure.
        setSent(true);
        setCountdown(cooldown.seconds);
        setNotice(
          `${cooldown.message}. The code we already sent is still valid — enter it below.`,
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
      setBusy(false);
    }
  };

  const verify = async () => {
    if (otp.length < 6) {
      setError("Enter the 6-digit OTP");
      toast.error("Enter the 6-digit OTP");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await verifyWhatsappOtp(e164, otp, purpose);
      persistWhatsappVerifiedPhone(e164);
      setDone(true);
      toast.success("Phone verified");
    } catch (err) {
      const message = formatApiErrorMessage(err, "Invalid OTP");
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verify this requirement</DialogTitle>
          <DialogDescription className="text-start text-sm leading-relaxed">
            {emailSent
              ? "We emailed you the submission status. "
              : "Your requirement was submitted for admin review. "}
            Confirm your phone with WhatsApp so tutors know this is an authentic request.
          </DialogDescription>
        </DialogHeader>

        {done || alreadyVerified ? (
          <div className="space-y-3 text-sm">
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">
              Phone verified. Admin will review your post next — you&apos;ll get another email when it goes live.
            </p>
            <Button asChild className="w-full" variant="gradient">
              <Link to="/my-posts">Go to My Posts</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Number: <strong className="text-foreground">{phoneCountryCode} {phone}</strong>
            </p>

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

            {!sent ? (
              <Button
                type="button"
                className="w-full"
                onClick={sendOtp}
                disabled={busy || countdown > 0}
              >
                {busy ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : null}
                {countdown > 0 ? `Try again in ${formatCooldown(countdown)}` : "Send WhatsApp OTP"}
              </Button>
            ) : (
              <div className="space-y-2">
                <Label>Enter OTP</Label>
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <InputOTPSlot key={i} index={i} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
                <Button type="button" className="w-full" onClick={verify} disabled={busy}>
                  {busy ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : null}
                  Verify phone
                </Button>
                <button
                  type="button"
                  className="w-full text-sm font-semibold text-primary disabled:opacity-40"
                  disabled={busy || countdown > 0}
                  onClick={sendOtp}
                >
                  {countdown > 0 ? `Resend in ${formatCooldown(countdown)}` : "Resend OTP"}
                </button>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
