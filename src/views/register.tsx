"use client";

import { Link, useNavigate, useSearch } from "@/lib/navigation";
import { useState } from "react";
import { Mail, Lock, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthDivider, GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { WhatsAppAuthButton } from "@/components/auth/WhatsAppAuthButton";
import { WhatsAppAuthModal } from "@/components/auth/WhatsAppAuthModal";
import { BrandLogo } from "@/components/BrandLogo";
import { isGoogleAuthConfigured } from "@/components/auth/GoogleAuthProvider";
import { useApp } from "@/hooks/use-app";
import { useGoogleAuth } from "@/hooks/use-google-auth";
import { afterAuthPath } from "@/lib/auth-redirect";
import { formatApiErrorMessage } from "@/lib/api";
import { toast } from "sonner";

function Register() {
  const { registerWithPassword } = useApp();
  const nav = useNavigate();
  const { role } = useSearch<{ role?: "student" | "teacher" }>();
  const { googleLoading, googleError, handleGoogleSuccess, handleGoogleError } = useGoogleAuth({
    role,
  });
  const [submitting, setSubmitting] = useState(false);
  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const showGoogle = isGoogleAuthConfigured();
  const roleLabel = role === "teacher" ? "tutor" : role;

  return (
    <section className="container mx-auto grid max-w-6xl items-center gap-8 px-4 py-6 lg:grid-cols-2 lg:gap-12 lg:py-8">
      <div className="hidden lg:block">
        <BrandLogo size="login" className="mb-5" />
        <h1 className="font-display text-4xl font-extrabold leading-tight">
          Join <span className="text-gradient-primary">TeacherPoint</span>
        </h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          Create your free {roleLabel} account in seconds — use Google, WhatsApp, or email.
        </p>
        <p className="mt-4 max-w-md rounded-xl border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          {role === "teacher"
            ? "Tutors verify with a one-time code, complete their profile, then receive a welcome email with courses."
            : "Students verify with a one-time code, then get a welcome email with popular courses to explore."}
        </p>
      </div>

      <div className="mx-auto w-full max-w-lg">
        <div className="mb-4 flex justify-center lg:hidden">
          <BrandLogo size="login" />
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-soft sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <h2 className="font-display text-xl font-bold sm:text-2xl">Create your account</h2>
            <p className="text-sm text-muted-foreground">
              As <span className="font-semibold capitalize text-foreground">{roleLabel}</span> ·{" "}
              <Link to="/role-select" className="font-semibold text-primary">
                Change
              </Link>
            </p>
          </div>

          {googleError ? (
            <p className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {googleError}
            </p>
          ) : null}

          <div className="relative z-[2] mt-4 grid gap-2 sm:grid-cols-2">
            {showGoogle ? (
              <GoogleSignInButton
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                disabled={submitting}
                loading={googleLoading}
                label={`Google · ${roleLabel}`}
                className="col-span-1"
              />
            ) : null}
            <WhatsAppAuthButton
              onClick={() => setWhatsappOpen(true)}
              disabled={submitting || googleLoading}
              label="WhatsApp"
              className={showGoogle ? "col-span-1" : "sm:col-span-2"}
            />
          </div>

          <AuthDivider label="or sign up with email" className="my-4" />

          <form
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              setSubmitting(true);
              try {
                const email = String(fd.get("email"));
                const session = await registerWithPassword({
                  name: String(fd.get("name")),
                  email,
                  password: String(fd.get("password")),
                  role: role ?? "student",
                });
                toast.success("Account created — you are now signed in!");

                if (session.verificationEmailSent || session.devOtp) {
                  toast.success(`Verification code sent to ${email}. Check your inbox.`, {
                    duration: 8000,
                  });
                } else if (session.verificationEmailError) {
                  toast.warning(
                    session.verificationEmailError ||
                      "Could not send verification email. Use Resend on the next screen.",
                    { duration: 8000 },
                  );
                }

                if (role !== "teacher" && session.welcomeEmailSent) {
                  toast.success(
                    `Welcome email with available courses sent to ${email}. Check your inbox.`,
                    { duration: 7000 },
                  );
                }

                nav({
                  to: afterAuthPath(
                    session.user.role,
                    session.profileComplete,
                    session.user.isVerified !== false,
                  ),
                });
              } catch (err) {
                toast.error(formatApiErrorMessage(err, "Registration failed"));
              } finally {
                setSubmitting(false);
              }
            }}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Full name</Label>
                <div className="relative mt-1">
                  <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    required
                    minLength={2}
                    className="pl-10"
                    placeholder="Jane Doe"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="pl-10"
                    placeholder="you@email.com"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="pl-10"
                  placeholder="At least 8 characters"
                />
              </div>
            </div>

            <label className="flex items-start gap-2 text-xs text-muted-foreground select-none">
              <input
                type="checkbox"
                name="agree"
                required
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-primary"
              />
              <span>
                I agree to the{" "}
                <Link to="/terms" className="font-semibold text-primary hover:underline">
                  Terms and Conditions
                </Link>{" "}
                for {role === "teacher" ? "tutors" : "students"}.
              </span>
            </label>

            <Button
              type="submit"
              size="lg"
              variant="gradient"
              className="w-full"
              disabled={submitting || googleLoading}
            >
              {submitting ? "Creating account…" : "Create account"}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-muted-foreground sm:text-sm">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary">
              Log in
            </Link>
            <span className="mx-2 text-border">·</span>
            <Link to="/forgot-password" className="font-semibold text-primary hover:underline">
              Forgot password?
            </Link>
          </p>

          <WhatsAppAuthModal
            open={whatsappOpen}
            onOpenChange={setWhatsappOpen}
            mode="signup"
            defaultRole={role}
          />
        </div>
      </div>
    </section>
  );
}

export default Register;
