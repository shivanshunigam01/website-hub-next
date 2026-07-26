"use client";

import { Link, useNavigate, useSearch } from "@/lib/navigation";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { canonicalUrl } from "@/lib/site-config";
import {
  Briefcase,
  Home,
  Wifi,
  ArrowRight,
  ShieldCheck,
  Search,
  Filter,
  Loader2,
  ClipboardList,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TutorJobCard } from "@/components/tutors/TutorJobCard";
import { useRequirementFacets, useTutorJobs } from "@/hooks/use-requirements-api";
import {
  filtersFromSearch,
  parseTutorJobMode,
  type TutorJobMode,
} from "@/lib/tutor-jobs-utils";
import { cn } from "@/lib/utils";

type TutorJobsSearch = {
  mode?: string;
  subject?: string;
  skill?: string;
  location?: string;
  jobType?: string;
  q?: string;
};

function TutorJobsPage() {
  const { t } = useTranslation("common");
  const MODE_TABS: { id: TutorJobMode; label: string; icon: typeof Briefcase }[] = [
    { id: "all", label: t("tutorJobs.tabAll"), icon: Briefcase },
    { id: "online", label: t("tutorJobs.tabOnline"), icon: Wifi },
    { id: "home", label: t("tutorJobs.tabHome"), icon: Home },
  ];
  const jobModeLabel = (m: TutorJobMode) =>
    m === "online"
      ? t("tutorJobs.titleOnline")
      : m === "home"
        ? t("tutorJobs.titleHome")
        : t("tutorJobs.titleAll");
  const navigate = useNavigate();
  const urlSearch = useSearch<TutorJobsSearch>();
  const mode = parseTutorJobMode(urlSearch.mode);
  const filters = useMemo(() => filtersFromSearch(urlSearch), [urlSearch]);

  const { data: facets } = useRequirementFacets();
  const { data, isLoading, isError } = useTutorJobs(filters);
  const jobs = data?.jobs ?? [];

  const [localQ, setLocalQ] = useState(urlSearch.q ?? "");

  const updateSearch = (patch: Partial<TutorJobsSearch>) => {
    navigate({
      search: (prev) => {
        const next = { ...prev, ...patch };
        for (const k of Object.keys(next) as (keyof TutorJobsSearch)[]) {
          if (!next[k]) delete next[k];
        }
        return next;
      },
      replace: true,
    });
  };

  const clearFilters = () => {
    setLocalQ("");
    navigate({ search: {}, replace: true });
  };

  const hasActiveFilters =
    !!filters.subject ||
    !!filters.skill ||
    !!filters.location ||
    !!filters.q ||
    (filters.jobType && filters.jobType !== "all") ||
    mode !== "all";

  return (
    <>
      <div className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-600 via-primary to-indigo-700" aria-hidden />
        <div className="container relative mx-auto px-4 py-10 sm:px-6 sm:py-12">
          <Badge className="mb-4 border-white/25 bg-white/15 text-white hover:bg-white/15">
            <ShieldCheck className="me-1 h-3 w-3" />
            {t("tutorJobs.badge")}
          </Badge>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {jobModeLabel(mode)}
          </h1>
          <p className="mt-3 max-w-2xl text-base text-white/85 sm:text-lg">
            {t("tutorJobs.subtitle")}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {MODE_TABS.map(({ id, label, icon: Icon }) => (
              <Link
                key={id}
                to="/tutor-jobs"
                search={{
                  ...urlSearch,
                  mode: id === "all" ? undefined : id,
                }}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition",
                  mode === id
                    ? "border-white bg-white text-primary shadow-md"
                    : "border-white/30 bg-white/10 text-white hover:bg-white/20",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <section className="container mx-auto px-4 py-8 sm:px-6 lg:py-10">
        {/* Filters */}
        <div className="mb-8 rounded-2xl border bg-card p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <Filter className="h-4 w-4 text-primary" />
            {t("tutorJobs.filterHeading")}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <form
              className="relative lg:col-span-2"
              onSubmit={(e) => {
                e.preventDefault();
                updateSearch({ q: localQ.trim() || undefined });
              }}
            >
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={localQ}
                onChange={(e) => setLocalQ(e.target.value)}
                placeholder={t("tutorJobs.searchPlaceholder")}
                className="ps-9"
              />
            </form>
            <Select
              value={filters.subject ?? "all"}
              onValueChange={(v) => updateSearch({ subject: v === "all" ? undefined : v })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("tutorJobs.subject", "Subject")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("tutorJobs.allSubjects")}</SelectItem>
                {(facets?.subjects ?? []).map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.skill ?? "all"}
              onValueChange={(v) => updateSearch({ skill: v === "all" ? undefined : v })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("tutorJobs.skill", "Skill")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("tutorJobs.allSkills")}</SelectItem>
                {(facets?.skills ?? []).map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.location ?? "all"}
              onValueChange={(v) => updateSearch({ location: v === "all" ? undefined : v })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("tutorJobs.location", "Location")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("tutorJobs.allLocations")}</SelectItem>
                {(facets?.locations ?? []).map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">{t("tutorJobs.type")}</span>
            {(
              [
                { id: "all", label: t("tutorJobs.typeAll") },
                { id: "tutoring", label: t("tutorJobs.typeTutoring"), icon: Briefcase },
                { id: "assignment", label: t("tutorJobs.typeAssignment"), icon: ClipboardList },
              ] as const
            ).map((item) => {
              const { id, label } = item;
              const Icon = "icon" in item ? item.icon : undefined;
              return (
              <button
                key={id}
                type="button"
                onClick={() => updateSearch({ jobType: id === "all" ? undefined : id })}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                  (filters.jobType ?? "all") === id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/40",
                )}
              >
                {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
                {label}
              </button>
            );
            })}
            {hasActiveFilters && (
              <Button type="button" variant="ghost" size="sm" onClick={clearFilters} className="ms-auto">
                <X className="me-1 h-3.5 w-3.5" />
                {t("tutorJobs.clearFilters")}
              </Button>
            )}
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold sm:text-2xl">
              {isLoading ? t("tutorJobs.loading") : t("tutorJobs.resultsTitle", { count: data?.total ?? jobs.length })}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("tutorJobs.resultsHint")}
            </p>
          </div>
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
