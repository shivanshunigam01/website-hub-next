"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "@/lib/navigation";
import { GraduationCap, Users } from "lucide-react";
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
    className="mx-auto min-h-[168px] max-w-3xl rounded-2xl border border-transparent bg-transparent md:min-h-[200px]"
    aria-hidden
  />
);

export function HeroSearchLazy() {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const [mountSearch, setMountSearch] = useState(false);

  useEffect(() => {
    const run = () => setMountSearch(true);
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(run, { timeout: 4500 });
      return () => window.cancelIdleCallback(id);
    }
    const timer = window.setTimeout(run, 1200);
    return () => window.clearTimeout(timer);
  }, []);

  const goToTutorSearch = (filters: TutorSearchFilters) => {
    navigate({ to: "/tutors", search: tutorSearchToUrl(filters) });
  };

  return (
    <>
      {mountSearch ? (
        <TutorSearchPanel variant="hero" showResults={false} onSearch={goToTutorSearch} />
      ) : (
        searchPlaceholder
      )}

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
    </>
  );
}
