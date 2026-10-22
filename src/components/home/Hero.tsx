"use client";

import dynamic from "next/dynamic";
import { Link, useNavigate } from "@/lib/navigation";
import {
  Users,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Award,
  Star,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TutorSearchFilters } from "@/types/tutor-search";
import { tutorSearchToUrl } from "@/lib/tutor-search-utils";
import { useTranslation } from "react-i18next";
import { HeroBackground } from "@/components/home/HeroBackground";

const TutorSearchPanel = dynamic(
  () => import("@/components/tutors/TutorSearchPanel").then((m) => m.TutorSearchPanel),
  {
    ssr: false,
    loading: () => (
      <div
        className="mx-auto min-h-[132px] max-w-3xl animate-pulse rounded-2xl border bg-background/60 backdrop-blur"
        aria-hidden
      />
    ),
  },
);

export function Hero() {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const titleLead = t("hero.titleLead");
  const titleAccent = t("hero.titleAccent");
  const hasAccentSplit =
    Boolean(titleAccent) &&
    titleLead !== titleAccent &&
    !titleAccent.startsWith("hero.");

  const goToTutorSearch = (filters: TutorSearchFilters) => {
    navigate({ to: "/tutors", search: tutorSearchToUrl(filters) });
  };

  return (
    <section className="relative min-h-[min(88vh,760px)] overflow-hidden border-b bg-gradient-hero">
      <HeroBackground />

      <div className="container relative mx-auto px-4 py-20 sm:px-6 md:py-28 lg:py-32">
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-background/70 px-4 py-1.5 text-xs font-medium text-foreground/80 backdrop-blur-md shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            {t("hero.badge")}
          </span>
        </div>

        <h1 className="hero-headline mx-auto mt-6 max-w-4xl text-center font-display text-4xl font-extrabold tracking-tight drop-shadow-sm sm:text-5xl lg:text-6xl">
          {hasAccentSplit ? (
            <>
              <span className="hero-title-lead block">{titleLead}</span>
              <span className="hero-title-accent mt-1 block">{titleAccent}</span>
            </>
          ) : (
            <span className="hero-title-lead block">{t("hero.title")}</span>
          )}
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-center text-base leading-relaxed text-foreground/80 sm:text-lg">
          {t("hero.subtitle")}
        </p>

        <div className="mt-9">
          <TutorSearchPanel variant="hero" showResults={false} onSearch={goToTutorSearch} />
        </div>

        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" variant="gradient" className="w-full sm:w-auto">
            <Link to="/tutors">
              <Users className="me-2 h-4 w-4" />
              {t("hero.findTutor")}
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full bg-background/70 backdrop-blur sm:w-auto">
            <Link to="/courses">
              <GraduationCap className="me-2 h-4 w-4" />
              {t("hero.browseCourses")}
            </Link>
          </Button>
        </div>

        <ul className="mt-8 flex flex-col items-center justify-center gap-3 text-sm text-foreground/80 sm:flex-row sm:gap-x-8">
          <li className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            {t("hero.trust.tutors")}
          </li>
          <li className="hidden h-1 w-1 rounded-full bg-border sm:block" />
          <li className="flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-500" />
            {t("hero.trust.certs")}
          </li>
          <li className="hidden h-1 w-1 rounded-full bg-border sm:block" />
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            {t("hero.trust.refund")}
          </li>
        </ul>

        <div className="mt-12 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 mx-auto">
          <div className="flex items-center gap-3 rounded-2xl border bg-card/90 p-4 shadow-xl backdrop-blur">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">{t("hero.card.students")}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t("hero.card.worldwide")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border bg-card/90 p-4 shadow-xl backdrop-blur">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-amber-500/10">
              <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">{t("hero.card.rating")}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t("hero.card.reviews")}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
