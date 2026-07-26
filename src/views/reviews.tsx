"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Star, ShieldCheck } from "lucide-react";
import { Link } from "@/lib/navigation";
import { TESTIMONIALS } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useApp } from "@/hooks/use-app";
import { api, formatApiErrorMessage } from "@/lib/api";

function Reviews() {
  const { t } = useTranslation("common");
  const { user } = useApp();
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submitReview = async () => {
    if (!user) {
      toast.info(t("reviews.toastSignIn", "Please sign in to leave a review."));
      return;
    }
    if (text.trim().length < 10) {
      toast.error(t("reviews.toastTooShort", "Please write at least a few words."));
      return;
    }
    setSubmitting(true);
    try {
      await api("/reviews", {
        method: "POST",
        body: JSON.stringify({
          rating,
          text: text.trim(),
          targetType: "platform",
        }),
      });
      toast.success(t("reviews.toastThanks"));
      setText("");
      setRating(5);
    } catch (err) {
      toast.error(formatApiErrorMessage(err, t("reviews.toastFailed", "Could not submit review.")));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container mx-auto px-4 py-10 max-w-4xl">
      <h1 className="font-display font-extrabold text-3xl">{t("reviews.title")}</h1>
      <p className="text-muted-foreground mt-2">{t("reviews.subtitle")}</p>

      <div className="bg-card border rounded-2xl p-6 mt-8">
        <h2 className="font-display font-bold mb-3">{t("reviews.leaveReview")}</h2>
        {!user ? (
          <p className="mb-3 text-sm text-muted-foreground">
            {t("reviews.signInHint", "Sign in to share your experience.")}{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              {t("nav.login")}
            </Link>
          </p>
        ) : null}
        <div className="flex gap-1 mb-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setRating(n)} aria-label={t("reviews.starsAria", "{{n}} stars", { n })}>
              <Star className={`h-7 w-7 ${n <= rating ? "fill-amber-500 text-amber-500" : "text-muted-foreground"}`} />
            </button>
          ))}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("reviews.placeholder")}
          className="w-full border rounded-lg p-3 text-sm min-h-[100px]"
        />
        <Button
          size="lg"
          variant="gradient"
          className="mt-3"
          disabled={submitting}
          onClick={submitReview}
        >
          {submitting ? t("reviews.submitting", "Submitting…") : t("reviews.submit")}
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-8">
        {TESTIMONIALS.map((item) => (
          <article key={item.id} className="bg-card border rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-primary text-white grid place-items-center font-bold">
                {item.initials}
              </div>
              <div>
                <div className="font-semibold text-sm flex items-center gap-1">
                  {item.name}
                  <ShieldCheck className="h-3.5 w-3.5 text-sky" />
                </div>
                <div className="text-xs text-muted-foreground">{item.role}</div>
              </div>
              <div className="ml-auto flex">
                {Array.from({ length: item.rating }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                ))}
              </div>
            </div>
            <p className="mt-3 text-sm">{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Reviews;
