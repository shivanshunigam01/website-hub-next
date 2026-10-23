"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useNavigate } from "@/lib/navigation";
import type { TutorSearchFilters } from "@/types/tutor-search";
import { tutorSearchToUrl } from "@/lib/tutor-search-utils";

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

/** Hero tutor search only — CTAs/trust copy are SSR in `HomeHeroServer` to cut TBT and CLS. */
export function HeroSearchLazy() {
  const navigate = useNavigate();
  const [mountSearch, setMountSearch] = useState(false);

  useEffect(() => {
    const run = () => setMountSearch(true);
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(run, { timeout: 5000 });
      return () => window.cancelIdleCallback(id);
    }
    const timer = window.setTimeout(run, 1200);
    return () => window.clearTimeout(timer);
  }, []);

  const goToTutorSearch = (filters: TutorSearchFilters) => {
    navigate({ to: "/tutors", search: tutorSearchToUrl(filters) });
  };

  return (
    <div className="mt-9">
      {mountSearch ? (
        <TutorSearchPanel variant="hero" showResults={false} onSearch={goToTutorSearch} />
      ) : (
        searchPlaceholder
      )}
    </div>
  );
}
