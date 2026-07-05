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
import type { AuthRole } from "@/lib/auth-types";

const COPY: Record<"teacher" | "student", { badge: string; blurb: string; success: string }> = {
  teacher: {
    badge: "Tutor verification",
    blurb: "continue to your tutor profile setup",
    success: "Email verified! Complete your tutor profile next.",
  },
  student: {
    badge: "Student verification",
    blurb: "start exploring courses and tutors",
    success: "Email verified! You can complete your profile next.",
  },
};

function VerifyEmail() {
  const { user, loading, verifyEmail, resendVerificationEmail } = useApp();
  const nav = useNavigate();
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const role = user?.role === "teacher" || user?.role === "student" ? user.role : null;
  const copy = role ? COPY[role] : COPY.student;

  useEffect(() => {
    if (loading) return;
    if (!user) {
      nav({ to: "/login" });
      return;
    }
    if (user.role !== "teacher" && user.role !== "student") {
      nav({ to: afterAuthPath(user.role, user.profileComplete ?? false, true) });
      return;
    }
    if (user.isVerified) {
      nav({ to: afterAuthPath(user.role, user.profileComplete ?? false, true) });
    }
  }, [loading, user, nav]);

  if (loading || !user || !role) {
    return <div className="container py-20 text-center text-muted-foreground">Loading…</div>;
  }

  const submit = async () => {
    if (otp.length !== 6) {
      toast.error("Enter the 6-digit code from your email");
      return;
    }
    setSubmitting(true);
    try {
      const session = await verifyEmail(otp);
      toast.success(
        user.role === "teacher"
          ? "Email verified! Complete your tutor profile next."
          : "Email verified! Welcome to TeacherPoint.",
      );
      nav({
        to: afterAuthPath(user.role, session.profileComplete, true),
      });
    } catch (err) {
      toast.error(formatApiErrorMessage(err, "Verification failed"));
    } finally {
      setSubmitting(false);
    }
  };

  const resend = async () => {
    setResending(true);
    try {
      await resendVerificationEmail();
      toast.success(`New code sent to ${user.email}`);
    } catch (err) {
      toast.error(formatApiErrorMessage(err, "Could not resend code"));
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
          <span className="text-sm font-semibold uppercase tracking-wide">
            {user.role === "teacher" ? "Tutor verification" : "Email verification"}
          </span>
        </div>
        <h1 className="font-display font-bold text-2xl">Verify your email</h1>
        <p className="text-sm text-muted-foreground mt-2">
          We sent a 6-digit code to{" "}
          <span className="font-medium text-foreground">{user.email}</span>. Enter it below to
          {user.role === "teacher" ? " continue to your tutor profile setup." : " activate your account."}
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
            {submitting ? "Verifying…" : "Verify & continue"}
          </Button>

          <Button variant="ghost" size="sm" disabled={resending} onClick={resend}>
            <Mail className="h-4 w-4 mr-2" />
            {resending ? "Sending…" : "Resend code"}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Wrong account?{" "}
          <Link to="/login" className="text-primary font-semibold">
            Log in with another email
          </Link>
        </p>
      </div>
    </section>
  );
}

export default VerifyEmail;
