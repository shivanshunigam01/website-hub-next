"use client";

import { Link, useNavigate, useSearch } from "@/lib/navigation";
import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandLogo } from "@/components/BrandLogo";
import { useApp } from "@/hooks/use-app";
import { formatApiErrorMessage } from "@/lib/api";
import { toast } from "sonner";

function ResetPassword() {
  const { token } = useSearch<{ token?: string }>();
  const { resetPassword } = useApp();
  const nav = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const missingToken = !token;

  return (
    <section className="container mx-auto grid max-w-6xl items-center gap-12 px-4 py-12 lg:grid-cols-2">
      <div className="hidden lg:block">
        <BrandLogo size="login" className="mb-6" />
        <h1 className="font-display text-4xl font-extrabold leading-tight">
          Choose a new <span className="text-gradient-primary">password</span>
        </h1>
        <p className="mt-4 max-w-md text-muted-foreground">
          Use a password that is at least 8 characters long and different from passwords you use elsewhere.
        </p>
      </div>

      <div className="mx-auto w-full max-w-md rounded-2xl border bg-card p-8 shadow-soft">
        <Link to="/login" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>
        <h2 className="font-display text-2xl font-bold">Reset password</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter and confirm your new account password.
        </p>

        {missingToken ? (
          <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            This reset link is missing a token. Please{" "}
            <Link to="/forgot-password" className="font-semibold underline">
              request a new password reset email
            </Link>
            .
          </div>
        ) : null}

        {formError ? (
          <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {formError}
          </p>
        ) : null}

        <form
          className="mt-6 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setFormError(null);
            const fd = new FormData(e.currentTarget);
            const password = String(fd.get("password") ?? "");
            const confirmPassword = String(fd.get("confirmPassword") ?? "");

            if (password !== confirmPassword) {
              setFormError("Passwords do not match.");
              return;
            }

            if (!token) {
              setFormError("Invalid or missing reset link.");
              return;
            }

            setSubmitting(true);
            try {
              await resetPassword(token, password);
              toast.success("Password reset successful. Please log in.");
              await nav({ to: "/login" });
            } catch (err) {
              const message = formatApiErrorMessage(err, "Could not reset password.");
              setFormError(message);
              toast.error(message);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <div>
            <Label htmlFor="password">New password</Label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                className="pl-10 pr-10"
                disabled={missingToken}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-label="Toggle new password visibility"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Repeat new password"
                className="pl-10 pr-10"
                disabled={missingToken}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-label="Toggle confirm password visibility"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" size="lg" variant="gradient" className="w-full" disabled={submitting || missingToken}>
            {submitting ? "Resetting..." : "Reset password"}
          </Button>
        </form>
      </div>
    </section>
  );
}

export default ResetPassword;
