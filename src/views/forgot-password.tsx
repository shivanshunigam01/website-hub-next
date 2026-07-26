"use client";

import { Link } from "@/lib/navigation";
import { useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandLogo } from "@/components/BrandLogo";
import { useApp } from "@/hooks/use-app";
import { formatApiErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

function ForgotPassword() {
  const { t } = useTranslation();
  const { requestPasswordReset } = useApp();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [deliveredTo, setDeliveredTo] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [devResetToken, setDevResetToken] = useState<string | null>(null);

  return (
    <section className="container mx-auto grid max-w-6xl items-center gap-12 px-4 py-12 lg:grid-cols-2">
      <div className="hidden lg:block">
        <BrandLogo size="login" className="mb-6" />
        <h1 className="font-display text-4xl font-extrabold leading-tight">{t("forgot.heroTitle")}</h1>
        <p className="mt-4 max-w-md text-muted-foreground">{t("forgot.heroSubtitle")}</p>
      </div>

      <div className="mx-auto w-full max-w-md rounded-2xl border bg-card p-8 shadow-soft">
        <Link to="/login" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
          <ArrowLeft className="h-4 w-4" />
          {t("forgot.back")}
        </Link>
        <h2 className="font-display text-2xl font-bold">{t("forgot.title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("forgot.subtitle")}</p>

        {submittedEmail ? (
          <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
            <p className="font-semibold text-foreground">{t("forgot.checkEmail")}</p>
            <p className="mt-1 text-muted-foreground">
              {deliveredTo
                ? t(
                    "forgot.sentTo",
                    "Password reset instructions were sent to {{email}}.",
                    { email: deliveredTo },
                  )
                : t(
                    "forgot.sentIfExists",
                    "If an account exists for {{email}}, a reset link has been sent to that address.",
                    { email: submittedEmail },
                  )}
            </p>
            {devResetToken ? (
              <Link
                to="/reset-password"
                search={{ token: devResetToken }}
                className="mt-3 inline-flex text-sm font-semibold text-primary hover:underline"
              >
                {t("forgot.openDevLink", "Open development reset link")}
              </Link>
            ) : null}
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
            setDevResetToken(null);
            setDeliveredTo("");
            const normalizedEmail = email.trim().toLowerCase();
            if (!normalizedEmail) {
              setFormError(t("forgot.emailRequired", "Please enter your email address."));
              return;
            }

            setSubmitting(true);
            try {
              const result = await requestPasswordReset(normalizedEmail);
              setSubmittedEmail(normalizedEmail);
              if (result.deliveredTo) setDeliveredTo(result.deliveredTo);
              if (result.devResetToken) setDevResetToken(result.devResetToken);
              if (result.sent === false && result.emailError) {
                const message =
                  result.emailError ||
                  t(
                    "forgot.emailSendFailed",
                    "Could not send the reset email. Check SMTP settings or try again later.",
                  );
                setFormError(message);
                toast.error(message, { duration: 8000 });
              } else if (result.sent && result.deliveredTo) {
                toast.success(
                  t("forgot.linkSent", "Password reset link sent to {{email}}", {
                    email: result.deliveredTo,
                  }),
                );
              } else if (result.sent) {
                toast.success(
                  t("forgot.instructionsSent", "Password reset instructions sent — check your inbox."),
                );
              } else {
                toast.message(
                  t(
                    "forgot.sentWhenApplicable",
                    "If an account exists for that email, reset instructions were sent when applicable.",
                  ),
                );
              }
            } catch (err) {
              const message = formatApiErrorMessage(
                err,
                t("forgot.requestFailed", "Could not send reset instructions."),
              );
              setFormError(message);
              toast.error(message);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <div>
            <Label htmlFor="email">{t("login.email")}</Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder={t("login.emailPlaceholder")}
                className="pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <Button type="submit" size="lg" variant="gradient" className="w-full" disabled={submitting}>
            {submitting ? t("forgot.sending") : t("forgot.send")}
          </Button>
        </form>
      </div>
    </section>
  );
}

export default ForgotPassword;
