"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@/lib/navigation";
import {
  Search,
  GraduationCap,
  MapPin,
  ShieldCheck,
  Wifi,
  WifiOff,
  SlidersHorizontal,
  Loader2,
  X,
  Filter,
  RotateCcw,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { TutorCard } from "@/components/cards/TutorCard";
import { TutorLocationsSidebar } from "@/components/tutors/TutorLocationsSidebar";
import { useTutorFacets, useTutorSearch } from "@/hooks/use-tutor-search";
import { usePopularSubjects } from "@/hooks/use-subject-catalog";
import { SubjectAutocomplete } from "@/components/tutors/SubjectAutocomplete";
import { LocationFilterCombobox } from "@/components/tutors/LocationFilterCombobox";
import { useCurrency } from "@/hooks/use-currency";
import type { TutorMode, TutorSearchFilters } from "@/types/tutor-search";
import { cn } from "@/lib/utils";
import {
  DEFAULT_TUTOR_FILTERS,
  normalizeTutorFilters,
  serializeTutorFilters,
} from "@/lib/tutor-search-utils";

type Props = {
  initial?: TutorSearchFilters;
  variant?: "hero" | "dashboard" | "page";
  onSearch?: (filters: TutorSearchFilters) => void;
  showResults?: boolean;
  className?: string;
};

const DEFAULT_FILTERS = DEFAULT_TUTOR_FILTERS;

const FALLBACK_POPULAR_SUBJECTS = [
  "Maths",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Computer Science",
  "Python",
  "JAVA",
  "IELTS",
  "Accountancy",
  "DBMS",
  "Academic Writing",
];

export function TutorSearchPanel({
  initial,
  variant = "page",
  onSearch,
  showResults = true,
  className = "",
}: Props) {
  const { data: facets } = useTutorFacets();
  const { data: popularCatalog = [] } = usePopularSubjects(12);
  const { symbol: visitorSymbol } = useCurrency();

  const popularSubjects = useMemo(() => {
    const fromApi = popularCatalog.map((s) => s.name);
    return fromApi.length ? fromApi : FALLBACK_POPULAR_SUBJECTS;
  }, [popularCatalog]);

  const facetSubjectOptions = useMemo(() => facets?.subjects ?? [], [facets?.subjects]);
  const initialKey = useMemo(
    () => serializeTutorFilters(normalizeTutorFilters(initial)),
    [
      initial?.q,
      initial?.subject,
      initial?.location,
      initial?.mode,
      initial?.verified,
      initial?.minRating,
      initial?.maxPrice,
      initial?.sortBy,
    ],
  );
  const [draft, setDraft] = useState<TutorSearchFilters>(() => normalizeTutorFilters(initial));
  const [applied, setApplied] = useState<TutorSearchFilters>(() => normalizeTutorFilters(initial));
  const [showAdvanced, setShowAdvanced] = useState(variant === "page" || variant === "dashboard");

  useEffect(() => {
    const next = normalizeTutorFilters(initial);
    setDraft(next);
    setApplied(next);
  }, [initialKey]);

  const { data, isLoading, isFetching, isError, error, refetch } = useTutorSearch(
    applied,
    1,
    24,
    showResults && variant !== "hero",
  );

  const runSearch = (next?: TutorSearchFilters) => {
    const f = normalizeTutorFilters(next ?? draft);
    setApplied(f);
    setDraft(f);
    onSearch?.(f);
  };

  const clearFilters = () => {
    const reset = { ...DEFAULT_FILTERS };
    setDraft(reset);
    runSearch(reset);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch();
  };

  const isHero = variant === "hero";
  const isPage = variant === "page";
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const applyNow = useCallback(
    (next: TutorSearchFilters) => {
      const normalized = normalizeTutorFilters(next);
      setDraft(normalized);
      if (isPage) runSearch(normalized);
    },
    [isPage, runSearch],
  );

  const scheduleApply = useCallback(
    (next: TutorSearchFilters) => {
      const normalized = normalizeTutorFilters(next);
      setDraft(normalized);
      if (!isPage) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => runSearch(normalized), 350);
    },
    [isPage, runSearch],
  );

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);
  const tutors = data?.tutors ?? [];
  const total = data?.total ?? 0;

  const locationOptions = useMemo(() => {
    const byKey = new Map<string, string>();
    for (const loc of facets?.locations ?? []) {
      const trimmed = loc?.trim();
      if (!trimmed) continue;
      const key = trimmed.toLowerCase();
      if (!byKey.has(key)) byKey.set(key, trimmed);
    }
    const current = draft.location?.trim();
    if (current) {
      const key = current.toLowerCase();
      if (!byKey.has(key)) byKey.set(key, current);
    }
    return [...byKey.values()].sort((a, b) => {
      if (a.toLowerCase() === "online") return -1;
      if (b.toLowerCase() === "online") return 1;
      return a.localeCompare(b);
    });
  }, [facets?.locations, draft.location]);

  const pickLocation = (value: string) => {
    if (value === "__all__") {
      applyNow({ ...draft, location: "" });
      return;
    }
    if (value.toLowerCase() === "online") {
      applyNow({ ...draft, location: "online", mode: "online" as TutorMode });
      return;
    }
    applyNow({ ...draft, location: value, mode: "all" as TutorMode });
  };

  const locationSelectValue = useMemo(() => {
    const cur = draft.location?.trim();
    if (!cur) return "__all__";
    const match = locationOptions.find((o) => o.toLowerCase() === cur.toLowerCase());
    return match ?? cur;
  }, [draft.location, locationOptions]);

  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; clear: () => void }[] = [];
    const subject = applied.subject || applied.q;
    if (subject) {
      chips.push({
        key: "subject",
        label: subject,
        clear: () => runSearch({ ...applied, subject: "", q: "" }),
      });
    }
    if (applied.location) {
      chips.push({
        key: "location",
        label: applied.location,
        clear: () => runSearch({ ...applied, location: "" }),
      });
    }
    if (applied.mode && applied.mode !== "all") {
      chips.push({
        key: "mode",
        label: applied.mode === "online" ? "Online" : "Home tutor",
        clear: () => runSearch({ ...applied, mode: "all" }),
      });
    }
    if (applied.verified) {
      chips.push({
        key: "verified",
        label: "Verified",
        clear: () => runSearch({ ...applied, verified: false }),
      });
    }
    if (applied.minRating && applied.minRating > 0) {
      chips.push({
        key: "minRating",
        label: `${applied.minRating}★+`,
        clear: () => runSearch({ ...applied, minRating: 0 }),
      });
    }
    if (applied.maxPrice != null && applied.maxPrice < 100) {
      chips.push({
        key: "maxPrice",
        label: `≤ ${visitorSymbol}${applied.maxPrice}/hr`,
        clear: () => runSearch({ ...applied, maxPrice: 100 }),
      });
    }
    return chips;
  }, [applied]);

  const filterResetButton = (
    <Button type="button" variant="ghost" size="sm" className="shrink-0 text-muted-foreground" onClick={clearFilters}>
      <RotateCcw className="me-1.5 h-3.5 w-3.5" />
      Reset
    </Button>
  );

  const filterFields = (
    <div className="space-y-5">
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Subject or skill
        </Label>
        <SubjectAutocomplete
          className="mt-2"
          value={draft.subject || draft.q || ""}
          onChange={(value) => scheduleApply({ ...draft, subject: value, q: value })}
          placeholder="e.g. Mathematics, Python"
          extraOptions={facetSubjectOptions}
        />
      </div>

      <div>
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Location
        </Label>
        <LocationFilterCombobox
          value={locationSelectValue}
          extraLocations={locationOptions}
          onChange={pickLocation}
          loading={!facets}
          className="mt-2"
        />
        {locationOptions.length === 0 && facets && (
          <p className="mt-1.5 text-xs text-muted-foreground">No tutor locations yet.</p>
        )}
      </div>

      <div>
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Session type
        </Label>
        <div className="mt-2 flex flex-wrap gap-2">
          <ModeChip
            active={draft.mode === "all"}
            onClick={() => applyNow({ ...draft, mode: "all" })}
            label="All"
          />
          <ModeChip
            active={draft.mode === "online"}
            onClick={() => applyNow({ ...draft, mode: "online" })}
            label="Online"
            icon={<Wifi className="h-3.5 w-3.5" />}
          />
          <ModeChip
            active={draft.mode === "in-person"}
            onClick={() => applyNow({ ...draft, mode: "in-person" })}
            label="Home"
            icon={<WifiOff className="h-3.5 w-3.5" />}
          />
        </div>
      </div>

      <div>
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Sort by
        </Label>
        <Select
          value={draft.sortBy ?? "rating"}
          onValueChange={(v) => applyNow({ ...draft, sortBy: v as TutorSearchFilters["sortBy"] })}
        >
          <SelectTrigger className="mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">Top rated</SelectItem>
            <SelectItem value="reviews">Most reviews</SelectItem>
            <SelectItem value="price_asc">Price: low to high</SelectItem>
            <SelectItem value="price_desc">Price: high to low</SelectItem>
            <SelectItem value="experience">Most experience</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Max price/hr · {visitorSymbol}{draft.maxPrice ?? 100}
        </Label>
        <Slider
          value={[draft.maxPrice ?? 100]}
          onValueChange={([v]) => scheduleApply({ ...draft, maxPrice: v })}
          max={100}
          step={5}
          className="mt-3"
        />
      </div>

      <div>
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Min rating · {(draft.minRating ?? 0).toFixed(1)}★
        </Label>
        <Slider
          value={[draft.minRating ?? 0]}
          onValueChange={([v]) => scheduleApply({ ...draft, minRating: v })}
          min={0}
          max={5}
          step={0.5}
          className="mt-3"
        />
      </div>

      <label className="flex cursor-pointer items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2.5 text-sm">
        <Checkbox
          checked={!!draft.verified}
          onCheckedChange={(c) => applyNow({ ...draft, verified: !!c })}
        />
        <ShieldCheck className="h-4 w-4 text-emerald-600" />
        Verified tutors only
      </label>

      {!isPage && (
        <div className="flex flex-col gap-2 pt-1">
          <Button type="submit" size="lg" variant="gradient" className="w-full">
            <Search className="me-2 h-4 w-4" />
            Search tutors
          </Button>
          <Button type="button" variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={clearFilters}>
            <RotateCcw className="me-2 h-3.5 w-3.5" />
            Reset filters
          </Button>
        </div>
      )}

    </div>
  );

  const heroForm = (
    <form
      onSubmit={onSubmit}
      className="relative mx-auto max-w-3xl rounded-2xl border border-border/60 bg-card/85 p-2 shadow-2xl shadow-primary/10 backdrop-blur-xl ring-1 ring-white/10 sm:p-2.5"
    >
      <div
        className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-primary/30 via-transparent to-fuchsia-500/30 opacity-70 blur-xl"
        aria-hidden
      />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <SubjectAutocomplete
          className="flex-1"
          value={draft.subject || draft.q || ""}
          onChange={(value) => setDraft((d) => ({ ...d, subject: value, q: value }))}
          placeholder="Subject or skill (e.g. Mathematics, Python)"
          inputClassName="h-12 border-0 bg-transparent shadow-none focus-visible:ring-0"
          extraOptions={facetSubjectOptions}
        />
        <div className="flex-1">
          <LocationFilterCombobox
            value={locationSelectValue}
            extraLocations={locationOptions}
            onChange={pickLocation}
            loading={!facets}
            variant="hero"
          />
        </div>
        <Button type="submit" size="lg" variant="gradient" className="shrink-0">
          <Search className="me-2 h-4 w-4" />
          Search tutors
        </Button>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2 px-1 pb-1">
        {popularSubjects.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => {
              const next = { ...draft, subject: tag, q: tag };
              setDraft(next);
              runSearch(next);
            }}
            className="rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs text-foreground/80 backdrop-blur transition hover:border-primary/50 hover:text-primary"
          >
            {tag}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            const next = { ...draft, mode: "online" as const, location: "online" };
            setDraft(next);
            runSearch(next);
          }}
          className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-700 dark:text-emerald-400"
        >
          <Wifi className="me-1 inline h-3 w-3" />
          Online only
        </button>
      </div>
    </form>
  );

  const dashboardForm = (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border bg-card p-4 sm:p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <SubjectAutocomplete
          value={draft.subject || draft.q || ""}
          onChange={(value) => setDraft((d) => ({ ...d, subject: value, q: value }))}
          placeholder="Subject or skill"
          extraOptions={facetSubjectOptions}
        />
        <div>
          <LocationFilterCombobox
            value={locationSelectValue}
            extraLocations={locationOptions}
            onChange={(v) => {
              if (v === "__all__") setDraft((d) => ({ ...d, location: "" }));
              else if (v.toLowerCase() === "online") setDraft((d) => ({ ...d, location: "online", mode: "online" }));
              else setDraft((d) => ({ ...d, location: v, mode: "all" }));
            }}
            loading={!facets}
          />
        </div>
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <ModeChip active={draft.mode === "all"} onClick={() => setDraft((d) => ({ ...d, mode: "all" }))} label="All" />
          <ModeChip active={draft.mode === "online"} onClick={() => setDraft((d) => ({ ...d, mode: "online" }))} label="Online" icon={<Wifi className="h-3.5 w-3.5" />} />
          <ModeChip active={draft.mode === "in-person"} onClick={() => setDraft((d) => ({ ...d, mode: "in-person" }))} label="Home" icon={<WifiOff className="h-3.5 w-3.5" />} />
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
          <Button type="submit" variant="gradient">
            <Search className="me-2 h-4 w-4" />
            Search tutors
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setShowAdvanced((v) => !v)}>
            <SlidersHorizontal className="me-2 h-4 w-4" />
            {showAdvanced ? "Hide filters" : "More filters"}
          </Button>
        </div>
      </div>
      {showAdvanced && (
        <div className="grid gap-5 border-t pt-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Country</Label>
            <Select
              value={draft.country || "__any__"}
              onValueChange={(v) => setDraft((d) => ({ ...d, country: v === "__any__" ? "" : v }))}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Any country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__any__">Any country</SelectItem>
                {(facets?.countriesWithTutors ?? []).map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">City</Label>
            <Select
              value={draft.city || "__any__"}
              onValueChange={(v) => setDraft((d) => ({ ...d, city: v === "__any__" ? "" : v }))}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Any city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__any__">Any city</SelectItem>
                {(facets?.citiesWithTutors ?? []).map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Min experience · {draft.minExperience ?? 0} yrs</Label>
            <Slider
              value={[draft.minExperience ?? 0]}
              onValueChange={([v]) => setDraft((d) => ({ ...d, minExperience: v }))}
              min={0}
              max={30}
              step={1}
              className="mt-3"
            />
          </div>
          <div className="flex flex-col justify-end gap-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={!!draft.homeTuition}
                onCheckedChange={(c) => setDraft((d) => ({ ...d, homeTuition: !!c }))}
              />
              Home tuition
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox checked={!!draft.verified} onCheckedChange={(c) => setDraft((d) => ({ ...d, verified: !!c }))} />
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Verified only
            </label>
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Sort by</Label>
            <Select value={draft.sortBy ?? "rating"} onValueChange={(v) => setDraft((d) => ({ ...d, sortBy: v as TutorSearchFilters["sortBy"] }))}>
              <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Top rated</SelectItem>
                <SelectItem value="reviews">Most reviews</SelectItem>
                <SelectItem value="price_asc">Price: low to high</SelectItem>
                <SelectItem value="price_desc">Price: high to low</SelectItem>
                <SelectItem value="experience">Most experience</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Max price/hr · {visitorSymbol}{draft.maxPrice ?? 100}</Label>
            <Slider value={[draft.maxPrice ?? 100]} onValueChange={([v]) => setDraft((d) => ({ ...d, maxPrice: v }))} max={100} step={5} className="mt-3" />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Min rating · {(draft.minRating ?? 0).toFixed(1)}★</Label>
            <Slider value={[draft.minRating ?? 0]} onValueChange={([v]) => setDraft((d) => ({ ...d, minRating: v }))} min={0} max={5} step={0.5} className="mt-3" />
          </div>
          <div className="flex flex-col justify-end">
            <Button type="button" variant="secondary" size="sm" onClick={() => runSearch()}>
              Apply filters
            </Button>
          </div>
        </div>
      )}
    </form>
  );

  const resultsSection = showResults && variant !== "hero" && (
    <div className={isPage ? "" : "mt-6"}>
      {isPage && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold sm:text-2xl">
              {isLoading || isFetching ? "Searching tutors…" : `${total} tutor${total === 1 ? "" : "s"} found`}
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Compare profiles, ratings and hourly rates
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden">
                  <Filter className="me-2 h-4 w-4" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[min(100vw,320px)] overflow-y-auto">
                <SheetHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
                  <SheetTitle>Filter tutors</SheetTitle>
                  {filterResetButton}
                </SheetHeader>
                <div className="mt-6">{filterFields}</div>
              </SheetContent>
            </Sheet>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="xl:hidden">
                  <MapPin className="me-2 h-4 w-4" />
                  Locations
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[min(100vw,300px)] p-0">
                <SheetHeader className="border-b px-4 py-3">
                  <SheetTitle>Browse by location</SheetTitle>
                </SheetHeader>
                <TutorLocationsSidebar
                  className="px-2 py-2"
                  selectedLocation={applied.location ?? ""}
                  countriesWithTutors={facets?.countriesWithTutors}
                  extraLocations={locationOptions}
                  onSelect={(loc) => pickLocation(loc)}
                  onClear={() => pickLocation("__all__")}
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      )}

      {!isPage && (
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {isLoading || isFetching ? "Searching…" : `${total} tutor${total === 1 ? "" : "s"} found`}
          </p>
        </div>
      )}

      {activeChips.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Active:</span>
          {activeChips.map((chip) => (
            <Badge key={chip.key} variant="secondary" className="gap-1 pr-1.5">
              {chip.label}
              <button type="button" onClick={chip.clear} className="rounded-full p-0.5 hover:bg-muted" aria-label={`Remove ${chip.label}`}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <button type="button" onClick={clearFilters} className="text-xs text-primary hover:underline">
            Clear all
          </button>
        </div>
      )}

      {(isLoading || isFetching) && (
        <div className="flex flex-col items-center justify-center gap-3 py-20">
          <Loader2 className="h-9 w-9 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Finding the best tutors for you…</p>
        </div>
      )}

      {isError && !isLoading && !isFetching && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center">
          <p className="font-medium text-destructive">Could not load tutors</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "Check that the backend is running and try again."}
          </p>
          <Button variant="outline" className="mt-4" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !isFetching && !isError && tutors.length === 0 && (
        <div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-16 text-center">
          <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <h3 className="mt-4 font-display text-lg font-bold">No tutors match your search</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Try a different subject, widen your location, or reset filters to browse all tutors.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {popularSubjects.slice(0, 4).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => runSearch({ ...DEFAULT_FILTERS, subject: tag, q: tag })}
                className="rounded-full border bg-card px-3 py-1.5 text-xs transition hover:border-primary hover:text-primary"
              >
                {tag}
              </button>
            ))}
          </div>
          <Button variant="outline" className="mt-5" onClick={clearFilters}>
            <RotateCcw className="me-2 h-4 w-4" />
            Reset all filters
          </Button>
        </div>
      )}

      {!isLoading && !isFetching && !isError && tutors.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {tutors.map((t) => (
            <TutorCard key={t.id} tutor={t} />
          ))}
        </div>
      )}

      {!isLoading && !isFetching && !isError && tutors.length > 0 && isPage && (
        <div className="mt-10 rounded-2xl border bg-gradient-to-br from-primary/5 via-background to-fuchsia-500/5 p-6 text-center sm:p-8">
          <Star className="mx-auto h-8 w-8 text-primary" />
          <h3 className="mt-3 font-display text-lg font-bold">Can&apos;t find the right tutor?</h3>
          <p className="mx-auto mt-1 max-w-lg text-sm text-muted-foreground">
            Post your requirement and let verified tutors reach out with tailored offers within hours.
          </p>
          <Button asChild size="lg" variant="gradient" className="mt-4">
            <Link to="/post-requirement">Post a requirement</Link>
          </Button>
        </div>
      )}
    </div>
  );

  if (isHero) {
    return <div className={className}>{heroForm}</div>;
  }

  if (isPage) {
    return (
      <div className={className}>
        <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_220px]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border bg-card p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 font-display text-base font-semibold">
                  <SlidersHorizontal className="h-4 w-4 text-primary" />
                  Filters
                </h3>
                {filterResetButton}
              </div>
              {filterFields}
            </div>
          </aside>
          <div>{resultsSection}</div>
          <TutorLocationsSidebar
            className="hidden xl:block"
            selectedLocation={applied.location ?? ""}
            countriesWithTutors={facets?.countriesWithTutors}
            extraLocations={locationOptions}
            onSelect={(loc) => pickLocation(loc)}
            onClear={() => pickLocation("__all__")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {dashboardForm}
      {resultsSection}
    </div>
  );
}

function ModeChip({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition",
        active
          ? "border-primary bg-primary/10 font-medium text-primary"
          : "border-border bg-background hover:border-primary/40",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

export function parseTutorSearchFromUrl(search: Record<string, unknown>): TutorSearchFilters {
  const str = (k: string) => (typeof search[k] === "string" ? search[k] : "") as string;
  const num = (k: string, def: number) => {
    const v = search[k];
    if (typeof v === "string" && v !== "") return Number(v);
    if (typeof v === "number") return v;
    return def;
  };
  const modeRaw = str("mode");
  let mode: TutorMode = "all";
  if (search.online === "true" || modeRaw === "online") mode = "online";
  if (search.online === "false" || modeRaw === "in-person") mode = "in-person";

  return {
    q: str("q") || undefined,
    subject: str("subject") || str("q") || undefined,
    location: str("location") || undefined,
    country: str("country") || undefined,
    city: str("city") || undefined,
    mode,
    homeTuition: search.homeTuition === "true" || search.homeTuition === true,
    minExperience: num("minExperience", 0),
    verified: search.verified === "true" || search.verified === true,
    minRating: num("minRating", 0),
    minPrice: num("minPrice", 0),
    maxPrice: num("maxPrice", 100),
    sortBy: (str("sortBy") as TutorSearchFilters["sortBy"]) || "rating",
  };
}

export function tutorSearchToUrl(search: TutorSearchFilters): Record<string, string | undefined> {
  return {
    q: search.q || search.subject || undefined,
    subject: search.subject || undefined,
    location: search.location || undefined,
    country: search.country || undefined,
    city: search.city || undefined,
    mode: search.mode && search.mode !== "all" ? search.mode : undefined,
    online:
      search.mode === "online" ? "true" : search.mode === "in-person" ? "false" : undefined,
    homeTuition: search.homeTuition ? "true" : undefined,
    minExperience: search.minExperience && search.minExperience > 0 ? String(search.minExperience) : undefined,
    verified: search.verified ? "true" : undefined,
    minRating: search.minRating && search.minRating > 0 ? String(search.minRating) : undefined,
    minPrice: search.minPrice && search.minPrice > 0 ? String(search.minPrice) : undefined,
    maxPrice: search.maxPrice != null && search.maxPrice < 100 ? String(search.maxPrice) : undefined,
    sortBy: search.sortBy !== "rating" ? search.sortBy : undefined,
  };
}
