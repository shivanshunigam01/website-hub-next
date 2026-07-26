"use client";

import { Link } from "@/lib/navigation";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { TrendingUp, PlayCircle, Star, BadgeCheck, MessageCircleQuestion, Briefcase } from "lucide-react";
import { AppImage } from "@/components/AppImage";

export function LevelUpSection() {
  const { t } = useTranslation("common");
  return (
    <section className="relative overflow-hidden border-y bg-gradient-to-b from-background via-accent/10 to-background py-16 sm:py-24">
      {/* decorative dots */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <span className="absolute left-[8%] top-[20%] h-2 w-2 rounded-full bg-primary/40" />
        <span className="absolute left-[55%] top-[12%] h-1.5 w-1.5 rounded-full bg-amber-400" />
        <span className="absolute right-[10%] top-[30%] h-2 w-2 rounded-full bg-emerald-400/60" />
        <span className="absolute left-[40%] bottom-[15%] h-1.5 w-1.5 rounded-full bg-primary/50" />
        <span className="absolute right-[25%] bottom-[20%] h-2 w-2 rounded-full bg-fuchsia-400/50" />
      </div>

      <div className="container relative grid items-center gap-12 lg:grid-cols-2">
        {/* LEFT */}
        <div>
          <div className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-sm shadow-sm">
            <span className="text-muted-foreground">{t("levelUp.badgeLead")}</span>
            <span className="font-semibold text-primary">{t("levelUp.badgeOrg")}</span>
            <span className="text-foreground">{t("levelUp.badgeTrail")}</span>
          </div>

          <h2 className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            <span className="text-primary">{t("levelUp.titleLead")}</span>
            <TrendingUp className="mx-2 inline h-8 w-8 text-primary sm:h-10 sm:w-10" />
            {t("levelUp.titleMid")}
            <br />
            {t("levelUp.titleWith")}
            <br />
            {t("levelUp.titleInternships")}{" "}
            <span className="ml-1 inline-block rounded-md bg-primary/15 px-3 py-1 text-primary">
              {t("levelUp.free")}
            </span>
          </h2>

          <p className="mt-5 text-base text-muted-foreground sm:text-lg">
            {t("levelUp.subtitle")}
          </p>

          {/* Rating */}
          <div className="mt-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-red-500 to-yellow-400 font-bold text-white">
              G
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-primary">4.9/5</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{t("levelUp.googleRatings")}</p>
            </div>
          </div>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Button asChild size="lg" variant="gradient" className="shadow-lg">
              <Link to="/courses">{t("levelUp.exploreCourses")}</Link>
            </Button>
            <Link
              to="/refund"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              <PlayCircle className="h-6 w-6" />
              {t("levelUp.refundOffer")}
            </Link>
          </div>
        </div>

        {/* RIGHT - collage */}
        <div className="relative mx-auto grid w-full max-w-lg grid-cols-2 gap-4">
          {/* feature card stack - placed above images, no overlap */}
          <div className="col-span-2 flex flex-col gap-2.5 sm:w-60">
            <FeatureChip icon={<BadgeCheck className="h-4 w-4 text-emerald-600" />} label={t("levelUp.chipRefund")} tint="bg-emerald-50 border-emerald-200" />
            <FeatureChip icon={<MessageCircleQuestion className="h-4 w-4 text-amber-600" />} label={t("levelUp.chipDoubt")} tint="bg-amber-50 border-amber-200" />
            <FeatureChip icon={<Briefcase className="h-4 w-4 text-fuchsia-600" />} label={t("levelUp.chipInternship")} tint="bg-fuchsia-50 border-fuchsia-200" />
          </div>

          {/* photo 1 */}
          <div className="relative aspect-[3/4] overflow-hidden rounded-[2rem] border-2 border-border bg-sky-100 sm:ml-auto sm:mt-0 sm:w-56">
            <AppImage
              src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=500&auto=format&fit=crop"
              alt={t("levelUp.altStudent")}
              fill
              sizes="(max-width: 640px) 50vw, 224px"
            />
          </div>

          {/* photo 2 */}
          <div className="relative aspect-[3/4] overflow-hidden rounded-[2rem] border-2 border-border bg-amber-100 sm:mt-12 sm:w-56">
            <AppImage
              src="https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=500&auto=format&fit=crop"
              alt={t("levelUp.altStudent")}
              fill
              sizes="(max-width: 640px) 50vw, 224px"
            />
          </div>

          {/* Google reviews card */}
          <div className="col-span-2 ml-auto rounded-2xl border-2 border-fuchsia-200 bg-card p-4 shadow-lg sm:w-56">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-red-500 to-yellow-400 text-sm font-bold text-white">
                G
              </div>
              <span className="text-sm font-medium">{t("levelUp.googleReviews")}</span>
            </div>
            <div className="mt-2 text-2xl font-bold">4.9/5</div>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureChip({ icon, label, tint }: { icon: React.ReactNode; label: string; tint: string }) {
  return (
    <div className={`flex items-center gap-2 rounded-xl border ${tint} px-3 py-2 shadow-sm`}>
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/80">{icon}</div>
      <span className="text-sm font-medium text-slate-900">{label}</span>
    </div>
  );
}
