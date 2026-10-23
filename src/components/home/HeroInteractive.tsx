"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "@/lib/navigation";
import {
  Users,
  ShieldCheck,
  CheckCircle2,
  Award,
  Star,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TutorSearchFilters } from "@/types/tutor-search";
import { tutorSearchToUrl } from "@/lib/tutor-search-utils";
import { useTranslation } from "react-i18next";

const TutorSearchPanel = dynamic(
  () => import("@/components/tutors/TutorSearchPanel").then((m) => m.TutorSearchPanel),
  {
    ssr: false,
    loading: () => (
      <div
        className="mx-auto min-h-[168px] max-w-3xl animate-pulse rounded-2xl border bg-background/60 backdrop-blur md:min-h-[200px]"
        aria-hidden
      />
    ),
  },
);

const searchPlaceholder = (
  <div
    className="mx-auto min-h-[168px] max-w-3xl animate-pulse rounded-2xl border bg-background/60 backdrop-blur md:min-h-[200px]"
    aria-hidden
  />
);

/** Client-only hero actions (search, CTAs). Headline/poster are server-rendered in HomeHeroServer. */
export function HeroInteractive() {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const [mountSearch, setMountSearch] = useState(false);

  useEffect(() => {
    const run = () => setMountSearch(true);
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(run, { timeout: 3500 });
      return () => window.cancelIdleCallback(id);
    }
    const timer = window.setTimeout(run, 800);
    return () => window.clearTimeout(timer);
  }, []);

  const goToTutorSearch = (filters: TutorSearchFilters) => {
    navigate({ to: "/tutors", search: tutorSearchToUrl(filters) });
  };

  return (
    <>
      <div className="mt-9">
        {mountSearch ? (
          <TutorSearchPanel variant="hero" showResults={false} onSearch={goToTutorSearch} />
        ) : (
          searchPlaceholder
        )}
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

      <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
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
    </>
  );
}
