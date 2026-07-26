"use client";

import { Link, useNavigate } from "@/lib/navigation";
import { useEffect, useState } from "react";
import { Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/BrandLogo";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useApp } from "@/hooks/use-app";
import { afterAuthPath } from "@/lib/auth-redirect";
import { formatApiErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

function VerifyEmail() {
  const { t } = useTranslation();
  const { user, loading, verifyEmail, resendVerificationEmail } = useApp();
  const nav = useNavigate();
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const role =
    user?.role === "teacher" || user?.role === "student" || user?.role === "parent" ? user.role : null;
  const copy = {
    teacher: {
      badge: t("verify.badgeTeacher"),
      continueBlurb: t("verify.blurbTeacher"),
      success: t("verify.successTeacher", "Email verified! Complete your tutor profile next."),
    },
    student: {
      badge: t("verify.badgeStudent"),
      continueBlurb: t("verify.blurbStudent"),
      success: t("verify.successStudent", "Email verified! You can complete your profile next."),
    },
    parent: {
      badge: t("verify.badgeParent"),
      continueBlurb: t("verify.blurbParent"),
      success: t("verify.successParent", "Email verified! Add your child's details next."),
    },
  }[role ?? "student"];

  useEffect(() => {
    if (loading) return;
    if (!user) {
      nav({ to: "/login" });
      return;
    }
    if (user.role !== "teacher" && user.role !== "student" && user.role !== "parent") {
      nav({ to: afterAuthPath(user.role, user.profileComplete ?? false, true) });
      return;
    }
    if (user.isVerified) {
      nav({ to: afterAuthPath(user.role, user.profileComplete ?? false, true) });
    }
  }, [loading, user, nav]);

  if (loading || !user || !role) {
    return <div className="container py-20 text-center text-muted-foreground">{t("verify.loading")}</div>;
  }

  const submit = async () => {
    if (otp.length !== 6) {
      toast.error(t("verify.codeRequired", "Enter the 6-digit code from your email"));
      return;
    }
    setSubmitting(true);
    try {
      const session = await verifyEmail(otp);
      toast.success(copy.success);
      nav({
        to: afterAuthPath(user.role, session.profileComplete, true),
      });
    } catch (err) {
      toast.error(formatApiErrorMessage(err, t("verify.failed", "Verification failed")));
    } finally {
      setSubmitting(false);
    }
  };

  const resend = async () => {
    setResending(true);
    try {
      await resendVerificationEmail();
      toast.success(t("verify.codeSent", "New code sent to {{email}}", { email: user.email }));
    } catch (err) {
      toast.error(formatApiErrorMessage(err, t("verify.resendFailed", "Could not resend code")));
    } finally {
      setResending(false);
    }
  };

  return (
    <section className="container mx-auto px-4 py-12 max-w-md">
      <div className="bg-card border rounded-2xl p-8 shadow-soft">
        <div className="flex justify-center mb-6">
          <BrandLogo size="login" />
        </div>
        <div className="flex items-center gap-2 text-primary mb-2">
          <ShieldCheck className="h-5 w-5" />
          <span className="text-sm font-semibold uppercase tracking-wide">{copy.badge}</span>
        </div>
        <h1 className="font-display font-bold text-2xl">{t("verify.title")}</h1>
        <p className="text-sm text-muted-foreground mt-2">
          {t("verify.sentTo", { email: user.email })}
          {copy.continueBlurb}
        </p>

        <div className="mt-8 flex flex-col items-center gap-4">
          <InputOTP maxLength={6} value={otp} onChange={setOtp}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>

          <Button
            size="lg"
            variant="gradient"
            className="mt-2 w-full"
            disabled={submitting || otp.length !== 6}
            onClick={submit}
          >
            {submitting ? t("verify.verifying") : t("verify.submit")}
          </Button>

          <Button variant="ghost" size="sm" disabled={resending} onClick={resend}>
            <Mail className="h-4 w-4 mr-2" />
            {resending ? t("verify.sending") : t("verify.resend")}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-6">
          {t("verify.wrongAccount")}{" "}
          <Link to="/login" className="text-primary font-semibold">
            {t("verify.otherEmail")}
          </Link>
        </p>
      </div>
    </section>
  );
}

export default VerifyEmail;
