"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Filter, Loader2, RotateCcw, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CourseCard } from "@/components/cards/CourseCard";
import { CoursesMentorHero } from "@/components/courses/CoursesMentorHero";
import { CATEGORIES } from "@/data/mock";
import { useCourses } from "@/hooks/use-catalog";
import { useCurrency } from "@/hooks/use-currency";
import { cn } from "@/lib/utils";

const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const DEFAULT_MAX_PRICE = 100;
const DEFAULT_MIN_RATING = 3;
const FILTER_LOADER_MS = 280;

type FilterPanelProps = {
  cat: string;
  setCat: (v: string) => void;
  level: string;
  setLevel: (v: string) => void;
  price: number[];
  setPrice: (v: number[]) => void;
  rating: number[];
  setRating: (v: number[]) => void;
  cert: boolean;
  setCert: (v: boolean) => void;
  priceSymbol: string;
  t: (key: string, opts?: Record<string, unknown>) => string;
  hasActiveFilters: boolean;
  onClear: () => void;
};

function FilterPanel({
  cat,
  setCat,
  level,
  setLevel,
  price,
  setPrice,
  rating,
  setRating,
  cert,
  setCert,
  priceSymbol,
  t,
  hasActiveFilters,
  onClear,
}: FilterPanelProps) {
  const levelLabels: Record<string, string> = {
    Beginner: t("coursesPage.levelBeginner"),
    Intermediate: t("coursesPage.levelIntermediate"),
    Advanced: t("coursesPage.levelAdvanced"),
  };
  return (
    <div className="space-y-6">
      {hasActiveFilters ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full gap-2"
          onClick={onClear}
        >
          <RotateCcw className="h-4 w-4 shrink-0" />
          {t("coursesPage.clearFilters")}
        </Button>
      ) : null}
      <div>
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">
          {t("coursesPage.category")}
        </Label>
        <div className="mt-2 space-y-2">
          {CATEGORIES.slice(1).map((c) => (
            <label key={c.id} className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox checked={cat === c.name} onCheckedChange={(v) => setCat(v ? c.name : "")} />
              {c.name}
            </label>
          ))}
        </div>
      </div>
      <div>
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">
          {t("coursesPage.level")}
        </Label>
        <div className="mt-2 space-y-2">
          {LEVELS.map((l) => (
            <label key={l} className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox checked={level === l} onCheckedChange={(v) => setLevel(v ? l : "")} />
              {levelLabels[l]}
            </label>
          ))}
        </div>
      </div>
      <div>
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">
          {t("coursesPage.maxPrice", { symbol: priceSymbol, price: price[0] })}
        </Label>
        <Slider value={price} onValueChange={setPrice} max={DEFAULT_MAX_PRICE} step={5} className="mt-3" />
      </div>
      <div>
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">
          {t("coursesPage.minRating", { rating: rating[0] })}
        </Label>
        <Slider
          value={rating}
          onValueChange={setRating}
          min={3}
          max={5}
          step={0.1}
          className="mt-3"
        />
      </div>
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <Checkbox checked={cert} onCheckedChange={(c) => setCert(!!c)} />
        {t("coursesPage.withCertificate")}
      </label>
    </div>
  );
}

function CoursesPage() {
  const { t } = useTranslation("common");
  const { data: courses = [], isLoading } = useCourses();
  const { symbol: priceSymbol } = useCurrency();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [level, setLevel] = useState("");
  const [price, setPrice] = useState([DEFAULT_MAX_PRICE]);
  const [rating, setRating] = useState([DEFAULT_MIN_RATING]);
  const [cert, setCert] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const skipFilterLoaderOnce = useRef(true);

  const hasActiveFilters = useMemo(
    () =>
      Boolean(q.trim()) ||
      Boolean(cat) ||
      Boolean(level) ||
      price[0] < DEFAULT_MAX_PRICE ||
      rating[0] > DEFAULT_MIN_RATING ||
      cert,
    [q, cat, level, price, rating, cert],
  );

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (q.trim()) n += 1;
    if (cat) n += 1;
    if (level) n += 1;
    if (price[0] < DEFAULT_MAX_PRICE) n += 1;
    if (rating[0] > DEFAULT_MIN_RATING) n += 1;
    if (cert) n += 1;
    return n;
  }, [q, cat, level, price, rating, cert]);

  const clearFilters = useCallback(() => {
    setQ("");
    setCat("");
    setLevel("");
    setPrice([DEFAULT_MAX_PRICE]);
    setRating([DEFAULT_MIN_RATING]);
    setCert(false);
    setMobileFiltersOpen(false);
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (skipFilterLoaderOnce.current) {
      skipFilterLoaderOnce.current = false;
      return;
    }
    setIsFiltering(true);
    const timer = window.setTimeout(() => setIsFiltering(false), FILTER_LOADER_MS);
    return () => window.clearTimeout(timer);
  }, [q, cat, level, price, rating, cert, isLoading]);

  const list = useMemo(
    () =>
      courses.filter((c) => {
        if (q && !`${c.title} ${c.instructor}`.toLowerCase().includes(q.toLowerCase())) return false;
        if (cat && c.category !== cat) return false;
        if (level && c.level !== level) return false;
        if (c.price > price[0]) return false;
        if (c.rating < rating[0]) return false;
        if (cert && !c.certificate) return false;
        return true;
      }),
    [courses, q, cat, level, price, rating, cert],
  );

  const filterPanelProps: FilterPanelProps = {
    cat,
    setCat,
    level,
    setLevel,
    price,
    setPrice,
    rating,
    setRating,
    cert,
    setCert,
    priceSymbol,
    t,
    hasActiveFilters,
    onClear: clearFilters,
  };

  const showGridLoader = isLoading || isFiltering;

  return (
    <>
      <CoursesMentorHero />
      <section className="container mx-auto px-4 py-8 sm:py-10">
        <div className="mb-6 sm:mb-8">
          <h1 className="font-display text-3xl font-extrabold md:text-4xl">{t("coursesPage.title")}</h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            {t("coursesPage.matchCount", { count: list.length })}
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,260px)_1fr] lg:gap-8">
          <aside className="hidden lg:block">
            <div className="sticky top-24 h-fit rounded-2xl border bg-card p-5">
              <div className="mb-4 flex items-center justify-between gap-2">
                <h3 className="font-display font-semibold">{t("coursesPage.filters")}</h3>
                {hasActiveFilters ? (
                  <Badge variant="secondary" className="shrink-0">
                    {activeFilterCount}
                  </Badge>
                ) : null}
              </div>
              <FilterPanel {...filterPanelProps} />
            </div>
          </aside>
          <div className="min-w-0">
            <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center">
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t("coursesPage.searchPlaceholder")}
                  className="pl-10"
                  aria-label={t("coursesPage.searchPlaceholder")}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {hasActiveFilters ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 lg:hidden"
                    onClick={clearFilters}
                  >
                    <RotateCcw className="h-4 w-4" />
                    {t("coursesPage.clearFilters")}
                  </Button>
                ) : null}
                <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="shrink-0 lg:hidden">
                      <Filter className="mr-2 h-4 w-4" />
                      {t("coursesPage.filters")}
                      {activeFilterCount > 0 ? (
                        <Badge variant="secondary" className="ml-2 h-5 min-w-5 px-1.5">
                          {activeFilterCount}
                        </Badge>
                      ) : null}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="max-h-[min(88vh,640px)] overflow-y-auto rounded-t-2xl">
                    <SheetHeader>
                      <SheetTitle className="flex items-center justify-between gap-2 pr-8">
                        <span>{t("coursesPage.filters")}</span>
                        {activeFilterCount > 0 ? (
                          <Badge variant="secondary">{activeFilterCount}</Badge>
                        ) : null}
                      </SheetTitle>
                    </SheetHeader>
                    <div className="mt-4 pb-6">
                      <FilterPanel {...filterPanelProps} />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            <div className="relative min-h-[12rem]">
              {showGridLoader ? (
                <div
                  className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl bg-background/75 backdrop-blur-[2px]"
                  role="status"
                  aria-live="polite"
                  aria-busy="true"
                >
                  <Loader2 className="h-9 w-9 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">
                    {isLoading ? t("coursesPage.loading") : t("coursesPage.applyingFilters")}
                  </p>
                </div>
              ) : null}
              <div
                className={cn(
                  "grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3",
                  showGridLoader && "pointer-events-none opacity-50",
                )}
              >
                {!isLoading &&
                  !isFiltering &&
                  list.map((c) => <CourseCard key={c.id} course={c} />)}
              </div>
              {!showGridLoader && list.length === 0 && (
                <div className="py-16 text-center text-muted-foreground sm:py-20">
                  <p>{t("coursesPage.empty")}</p>
                  {hasActiveFilters ? (
                    <Button type="button" variant="link" className="mt-3" onClick={clearFilters}>
                      {t("coursesPage.clearFilters")}
                    </Button>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default CoursesPage;
