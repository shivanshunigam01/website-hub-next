"use client";

import { Link, useNavigate, useSearch } from "@/lib/navigation";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Briefcase,
  ArrowRight,
  Search,
  Loader2,
  MapPin,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubjectAutocomplete } from "@/components/tutors/SubjectAutocomplete";
import { TutorJobCard } from "@/components/tutors/TutorJobCard";
import { useRequirementFacets, useTutorJobs } from "@/hooks/use-requirements-api";
import {
  filtersFromSearch,
  parseTutorJobMode,
  type TutorJobMode,
} from "@/lib/tutor-jobs-utils";
import type { TutorJobsFilters } from "@/types/requirement";
import { cn } from "@/lib/utils";

type TutorJobsSearch = {
  mode?: string;
  subject?: string;
  skill?: string;
  location?: string;
  jobType?: string;
  level?: string;
  q?: string;
};

type CategoryTab = "all" | "online" | "home" | "assignment";

const LEVEL_OPTIONS: { value: NonNullable<TutorJobsFilters["level"]>; labelKey: string; fallback: string }[] = [
  { value: "all", labelKey: "tutorJobs.levelAny", fallback: "Level" },
  { value: "elem", labelKey: "tutorJobs.levelElem", fallback: "Elementary" },
  { value: "middle", labelKey: "tutorJobs.levelMiddle", fallback: "Middle school" },
  { value: "high", labelKey: "tutorJobs.levelHigh", fallback: "High school" },
  { value: "college", labelKey: "tutorJobs.levelCollege", fallback: "College / University" },
  { value: "pro", labelKey: "tutorJobs.levelPro", fallback: "Professional" },
];

function activeCategory(mode: TutorJobMode, jobType: TutorJobsFilters["jobType"]): CategoryTab {
  if (jobType === "assignment") return "assignment";
  if (mode === "online") return "online";
  if (mode === "home") return "home";
  return "all";
}

function TutorJobsPage() {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const urlSearch = useSearch<TutorJobsSearch>();
  const filters = useMemo(() => filtersFromSearch(urlSearch), [urlSearch]);
  const mode = parseTutorJobMode(urlSearch.mode);
  const category = activeCategory(mode, filters.jobType);

  const { data: facets } = useRequirementFacets();
  const { data, isLoading, isError } = useTutorJobs(filters);
  const jobs = data?.jobs ?? [];
  const total = data?.total ?? jobs.length;

  const [draftSubject, setDraftSubject] = useState(urlSearch.subject ?? urlSearch.q ?? "");
  const [draftLocation, setDraftLocation] = useState(urlSearch.location ?? "");

  useEffect(() => {
    setDraftSubject(urlSearch.subject ?? urlSearch.q ?? "");
    setDraftLocation(urlSearch.location ?? "");
  }, [urlSearch.subject, urlSearch.q, urlSearch.location]);

  const facetSubjects = useMemo(() => {
    const set = new Set<string>([...(facets?.subjects ?? []), ...(facets?.skills ?? [])]);
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [facets?.subjects, facets?.skills]);

  const updateSearch = (patch: Partial<TutorJobsSearch>, replace = true) => {
    navigate({
      search: (prev) => {
        const next = { ...prev, ...patch };
        for (const k of Object.keys(next) as (keyof TutorJobsSearch)[]) {
          if (!next[k] || next[k] === "all") delete next[k];
        }
        return next;
      },
      replace,
    });
  };

  const runSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    updateSearch({
      subject: draftSubject.trim() || undefined,
      location: draftLocation.trim() || undefined,
      q: undefined,
      skill: undefined,
    });
  };

  const setCategory = (tab: CategoryTab) => {
    if (tab === "all") {
      updateSearch({ mode: undefined, jobType: undefined });
      return;
    }
    if (tab === "assignment") {
      updateSearch({ mode: undefined, jobType: "assignment" });
      return;
    }
    updateSearch({ mode: tab, jobType: undefined });
  };

  const clearFilters = () => {
    setDraftSubject("");
    setDraftLocation("");
    navigate({ search: {}, replace: true });
  };

  const hasActiveFilters =
    !!filters.subject ||
    !!filters.skill ||
    !!filters.location ||
    !!filters.q ||
    (filters.jobType && filters.jobType !== "all") ||
    (filters.level && filters.level !== "all") ||
    mode !== "all";

  const heading =
    category === "online"
      ? t("tutorJobs.headingOnline", "Online tutor jobs")
      : category === "home"
        ? t("tutorJobs.headingHome", "Home tutor jobs")
        : category === "assignment"
          ? t("tutorJobs.headingAssignment", "Assignment tutor jobs")
          : filters.location
            ? t("tutorJobs.headingInLocation", "Tutor jobs in {{location}}", {
                location: filters.location,
              })
            : t("tutorJobs.headingAllCountries", "Tutor jobs from all countries");

  const resultsLabel = filters.location
    ? t("tutorJobs.resultsInLocation", "{{formattedCount}} tutor jobs in {{location}} found", {
        count: total,
        location: filters.location,
        formattedCount: total.toLocaleString(),
      })
    : t("tutorJobs.resultsAllCountries", "{{formattedCount}} tutor jobs from all countries found", {
        count: total,
        formattedCount: total.toLocaleString(),
      });

  const CATEGORY_TABS: { id: CategoryTab; label: string }[] = [
    { id: "all", label: t("tutorJobs.tabAll", "All") },
    { id: "online", label: t("tutorJobs.tabOnline", "Online") },
    { id: "home", label: t("tutorJobs.tabHome", "Home") },
    { id: "assignment", label: t("tutorJobs.tabAssignment", "Assignment") },
  ];

  return (
    <>
      <section className="border-b bg-gradient-to-b from-primary/[0.06] via-background to-background">
        <div className="container mx-auto px-4 py-10 sm:px-6 sm:py-12 lg:py-14">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {heading}
            </h1>

            <form
              onSubmit={runSearch}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-stretch sm:justify-center"
            >
              <div className="min-w-0 flex-1 sm:max-w-xs">
                <SubjectAutocomplete
                  value={draftSubject}
                  onChange={setDraftSubject}
                  placeholder={t("tutorJobs.subjectSkillPlaceholder", "Subject / Skill")}
                  extraOptions={facetSubjects}
                  showIcon={false}
                  inputClassName="h-12 rounded-xl border-border bg-card text-base shadow-sm"
                />
              </div>
              <div className="relative min-w-0 flex-1 sm:max-w-xs">
                <MapPin className="pointer-events-none absolute start-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={draftLocation}
                  onChange={(e) => setDraftLocation(e.target.value)}
                  placeholder={t("tutorJobs.locationPlaceholder", "Location")}
                  list="tutor-jobs-locations"
                  className="h-12 rounded-xl border-border bg-card ps-9 text-base shadow-sm"
                />
                <datalist id="tutor-jobs-locations">
                  {(facets?.locations ?? []).map((loc) => (
                    <option key={loc} value={loc} />
                  ))}
                </datalist>
              </div>
              <Button type="submit" size="lg" variant="gradient" className="h-12 shrink-0 rounded-xl px-6">
                <Search className="me-2 h-4 w-4" />
                {t("tutorJobs.search", "Search")}
              </Button>
            </form>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
              <nav
                className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
                aria-label={t("tutorJobs.filterHeading", "Filter tutor jobs")}
              >
                {CATEGORY_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setCategory(tab.id)}
                    className={cn(
                      "relative pb-1.5 text-sm font-semibold transition-colors",
                      category === tab.id
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {tab.label}
                    {category === tab.id ? (
                      <span className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-primary" />
                    ) : null}
                  </button>
                ))}
              </nav>

              <Select
                value={filters.level ?? "all"}
                onValueChange={(v) =>
                  updateSearch({ level: v === "all" ? undefined : v })
                }
              >
                <SelectTrigger className="h-9 w-auto min-w-[7.5rem] rounded-lg border-border bg-card px-3 text-sm shadow-sm">
                  <SelectValue placeholder={t("tutorJobs.levelAny", "Level")} />
                </SelectTrigger>
                <SelectContent>
                  {LEVEL_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {t(opt.labelKey, opt.fallback)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {hasActiveFilters ? (
                <Button type="button" variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                  <X className="me-1 h-3.5 w-3.5" />
                  {t("tutorJobs.clearFilters", "Clear filters")}
                </Button>
              ) : null}
            </div>

            <p className="mt-6 text-sm text-muted-foreground sm:text-base">
              {isLoading ? t("tutorJobs.loading", "Loading jobs…") : resultsLabel}
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8 sm:px-6 lg:py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">{t("tutorJobs.resultsHint")}</p>
          <Button asChild variant="outline" size="sm">
            <Link to="/post-requirement">
              {t("tutorJobs.postCta")}
              <ArrowRight className="ms-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-16 text-center">
            <p className="text-sm text-muted-foreground">{t("tutorJobs.loadError")}</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-16 text-center">
            <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <h3 className="mt-4 font-display text-lg font-bold">{t("tutorJobs.emptyTitle")}</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              {t("tutorJobs.emptyDesc")}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" className="mt-5" onClick={clearFilters}>
                {t("tutorJobs.clearFilters")}
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {jobs.map((job) => (
              <TutorJobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default TutorJobsPage;
