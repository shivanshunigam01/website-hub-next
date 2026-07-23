"use client";

import { useState } from "react";
import { Link } from "@/lib/navigation";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/hooks/use-app";
import { formatApiErrorMessage } from "@/lib/api";
import { toast } from "sonner";

type AccountSecurityPanelProps = {
  role: "student" | "teacher" | "parent";
};

export function AccountSecurityPanel({ role }: AccountSecurityPanelProps) {
  const { user, changePassword, requestPasswordReset } = useApp();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [changing, setChanging] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const roleLabel = role === "teacher" ? "tutor" : role;
  const hasPassword =
    typeof user?.hasPassword === "boolean" ? user.hasPassword : user?.provider === "local";
  const canEmailReset = Boolean(user?.email?.trim());
  const providerLabel =
    user?.provider === "google" ? "Google" : user?.provider === "whatsapp" ? "WhatsApp" : "email";

  return (
    <div className="bg-card border rounded-2xl p-5 space-y-6">
      {hasPassword ? (
        <>
          <div>
            <h3 className="text-sm font-semibold">Change password</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Update your {roleLabel} account password while signed in.
            </p>
          </div>

          {formError ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {formError}
            </p>
          ) : null}

          <form
            className="space-y-4 max-w-md"
            onSubmit={async (e) => {
              e.preventDefault();
              setFormError(null);
              const fd = new FormData(e.currentTarget);
              const currentPassword = String(fd.get("currentPassword") ?? "");
              const password = String(fd.get("password") ?? "");
              const confirmPassword = String(fd.get("confirmPassword") ?? "");

              if (password !== confirmPassword) {
                setFormError("New passwords do not match.");
                return;
              }

              setChanging(true);
              try {
                await changePassword(currentPassword, password);
                e.currentTarget.reset();
                toast.success("Password updated successfully");
              } catch (err) {
                const message = formatApiErrorMessage(err, "Could not update password.");
                setFormError(message);
                toast.error(message);
              } finally {
                setChanging(false);
              }
            }}
          >
            <div>
              <Label htmlFor="currentPassword">Current password</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type={showCurrent ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-label="Toggle current password visibility"
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="password">New password</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showNew ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-label="Toggle new password visibility"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm new password</Label>
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

            <Button type="submit" disabled={changing}>
              {changing ? "Updating..." : "Update password"}
            </Button>
          </form>
        </>
      ) : (
        <div>
          <h3 className="text-sm font-semibold">Set a password</h3>
          <p className="text-xs text-muted-foreground mt-1">
            You signed in with {providerLabel} and do not have an email password yet.
            {canEmailReset
              ? " Email yourself a link to set one, or keep using your provider to sign in."
              : " Continue signing in with WhatsApp — add an email on your profile to enable password login."}
          </p>
        </div>
      )}

      <div className="border-t pt-5 space-y-3">
        <div>
          <h3 className="text-sm font-semibold">{hasPassword ? "Forgot your password?" : "Email set-password link"}</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {canEmailReset
              ? `Send a ${hasPassword ? "reset" : "set-password"} link to ${user?.email}.`
              : "Add an email to your account first to receive a password link."}
          </p>
        </div>

        {resetSent ? (
          <p className="text-sm text-muted-foreground rounded-xl border border-primary/20 bg-primary/5 p-3">
            If an account exists for your email, instructions have been sent.
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={sendingReset || !canEmailReset}
            onClick={async () => {
              if (!user?.email) return;
              setSendingReset(true);
              try {
                const result = await requestPasswordReset(user.email);
                if (result.sent === false && result.emailError) {
                  toast.error(
                    result.emailError ||
                      "Could not send the reset email. Check SMTP settings or try again later.",
                    { duration: 8000 },
                  );
                } else if (result.sent && result.deliveredTo) {
                  setResetSent(true);
                  toast.success(`Password link sent to ${result.deliveredTo}`);
                } else if (result.sent) {
                  setResetSent(true);
                  toast.success("Password link sent — check your inbox.");
                } else {
                  setResetSent(true);
                  toast.message("If your account supports password reset, check your inbox.");
                }
              } catch (err) {
                toast.error(formatApiErrorMessage(err, "Could not send reset link."));
              } finally {
                setSendingReset(false);
              }
            }}
          >
            <Mail className="h-4 w-4 mr-2" />
            {sendingReset ? "Sending..." : "Email password link"}
          </Button>
          <Button type="button" variant="ghost" size="sm" asChild>
            <Link to="/forgot-password">Open forgot password page</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
