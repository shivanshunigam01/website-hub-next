"use client";

import { Link, useNavigate, useSearch } from "@/lib/navigation";
import { useMemo } from "react";
import { canonicalUrl } from "@/lib/site-config";
import {
  ArrowRight,
  GraduationCap,
  Home,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Wifi,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TutorSearchPanel,
  parseTutorSearchFromUrl,
  tutorSearchToUrl,
} from "@/components/tutors/TutorSearchPanel";
import { useTutorFacets } from "@/hooks/use-tutor-search";
import type { TutorSearchFilters } from "@/types/tutor-search";
import { TutorPageBannerBackground } from "@/components/tutors/TutorPageBannerBackground";
import { cn } from "@/lib/utils";

type TutorsSearch = {
  q?: string;
  subject?: string;
  location?: string;
  mode?: string;
  online?: string;
  verified?: string;
  minRating?: string;
  maxPrice?: string;
  sortBy?: string;
};

const MODE_TABS = [
  { id: "all" as const, label: "All tutors", icon: Users },
  { id: "online" as const, label: "Online", icon: Wifi },
  { id: "in-person" as const, label: "Home tutors", icon: Home },
];

function TutorsPage() {
  const navigate = useNavigate();
  const urlSearch = useSearch();
  const initial = useMemo(
    () => parseTutorSearchFromUrl(urlSearch),
    [
      urlSearch.q,
      urlSearch.subject,
      urlSearch.location,
      urlSearch.mode,
      urlSearch.online,
      urlSearch.verified,
      urlSearch.minRating,
      urlSearch.maxPrice,
      urlSearch.sortBy,
    ],
  );
  const { data: facets } = useTutorFacets();

  const mode = initial.mode ?? "all";
  const title =
    mode === "online"
      ? "Online tutors"
      : mode === "in-person"
        ? "Home tutors near you"
        : "Find your perfect tutor";

  const subtitle =
    mode === "online"
      ? "Live video sessions with verified experts — flexible schedules, every subject."
      : mode === "in-person"
        ? "Trusted local tutors for in-person sessions at your home or a nearby location."
        : "Search by subject, city, rating and price. Compare profiles and book the right mentor.";

  const syncUrl = (filters: TutorSearchFilters) => {
    navigate({ to: "/tutors", search: tutorSearchToUrl(filters), replace: true });
  };

  const tabSearch = (tabId: (typeof MODE_TABS)[number]["id"]) => {
    if (tabId === "online") {
      navigate({ to: "/tutors", search: { mode: "online", online: "true" } });
    } else if (tabId === "in-person") {
      navigate({ to: "/tutors", search: { mode: "in-person", online: "false" } });
    } else {
      navigate({ to: "/tutors", search: {} });
    }
  };

  return (
    <>
      <div className="relative overflow-hidden border-b">
        <TutorPageBannerBackground />

        <div className="container relative mx-auto px-4 py-10 sm:px-6 sm:py-12 lg:py-14">
          <div className="max-w-3xl">
            <Badge className="mb-4 border-white/25 bg-white/15 text-white hover:bg-white/15">
              <Sparkles className="me-1 h-3 w-3" />
              Tutor directory
            </Badge>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            <p className="mt-3 max-w-2xl text-base text-white/85 sm:text-lg">{subtitle}</p>

            <div className="mt-6 flex flex-wrap gap-4 text-sm text-white/90">
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                {(facets?.totalTutors ?? 0).toLocaleString()}+ tutors
              </span>
              <span className="inline-flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4" />
                {(facets?.subjects?.length ?? 100)}+ subjects
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" />
                Verified profiles
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-amber-300 text-amber-300" />
                Rated & reviewed
              </span>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" variant="secondary" className="shadow-lg">
                <Link to="/post-requirement">
                  Request a tutor
                  <ArrowRight className="ms-1 h-4 w-4" />
                </Link>
              </Button>
              <span className="text-sm text-white/75">Free to browse · No signup required</span>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {MODE_TABS.map(({ id, label, icon: Icon }) => {
              const active = mode === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => tabSearch(id)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition",
                    active
                      ? "border-white bg-white text-primary shadow-md"
                      : "border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <section className="container mx-auto px-4 py-8 sm:px-6 lg:py-10">
        <TutorSearchPanel variant="page" initial={initial} onSearch={syncUrl} showResults />
      </section>
    </>
  );
}

export default TutorsPage;
