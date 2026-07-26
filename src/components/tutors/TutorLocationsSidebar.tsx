"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { MapPin } from "lucide-react";
import { BROWSE_COUNTRIES, ONLINE_LOCATION_LABEL } from "@/data/tutor-locations";
import { cn } from "@/lib/utils";

type TutorLocationsSidebarProps = {
  selectedLocation: string;
  countriesWithTutors?: string[];
  extraLocations?: string[];
  onSelect: (location: string) => void;
  onClear: () => void;
  className?: string;
};

export function TutorLocationsSidebar({
  selectedLocation,
  countriesWithTutors = [],
  extraLocations = [],
  onSelect,
  onClear,
  className,
}: TutorLocationsSidebarProps) {
  const { t } = useTranslation("common");
  const activeKey = selectedLocation.trim().toLowerCase();
  const tutorCountryKeys = useMemo(
    () => new Set(countriesWithTutors.map((c) => c.toLowerCase())),
    [countriesWithTutors],
  );

  const regionLinks = useMemo(() => {
    const countryKeys = new Set(BROWSE_COUNTRIES.map((c) => c.toLowerCase()));
    return extraLocations.filter((loc) => {
      const lower = loc.toLowerCase();
      if (lower === "online") return false;
      return !countryKeys.has(lower);
    });
  }, [extraLocations]);

  const linkClass = (isActive: boolean, hasTutors: boolean) =>
    cn(
      "block w-full truncate py-1 text-left text-sm transition hover:underline",
      isActive
        ? "font-semibold text-primary underline"
        : hasTutors
          ? "text-sky-700 hover:text-sky-900 dark:text-sky-400 dark:hover:text-sky-300"
          : "text-sky-600/80 hover:text-sky-800 dark:text-sky-500/80",
    );

  return (
    <aside className={cn("flex flex-col", className)}>
      <div className="sticky top-24 rounded-2xl border bg-card shadow-sm">
        <div className="border-b px-4 py-3">
          <h3 className="flex items-center gap-2 font-display text-base font-semibold text-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            {t("search.locations")}
          </h3>
          {activeKey ? (
            <button
              type="button"
              onClick={onClear}
              className="mt-1 text-xs text-muted-foreground hover:text-primary hover:underline"
            >
              {t("locationFilter.showAllTutors", "Show all tutors")}
            </button>
          ) : null}
        </div>

        <nav
          className="max-h-[min(70vh,640px)] overflow-y-auto px-4 py-3"
          aria-label={t("search.browseByLocation")}
        >
          <ul className="space-y-0.5">
            <li>
              <button
                type="button"
                onClick={() => onSelect(ONLINE_LOCATION_LABEL)}
                className={linkClass(activeKey === "online", true)}
              >
                {t("search.modeOnline")}
              </button>
            </li>

            {regionLinks.length > 0 && (
              <>
                <li className="pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("locationFilter.regions", "Regions")}
                </li>
                {regionLinks.map((loc) => (
                  <li key={loc}>
                    <button
                      type="button"
                      onClick={() => onSelect(loc)}
                      className={linkClass(activeKey === loc.toLowerCase(), true)}
                    >
                      {loc}
                    </button>
                  </li>
                ))}
              </>
            )}

            <li className="pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t("stats.countries")}
            </li>
            {BROWSE_COUNTRIES.map((country) => {
              const hasTutors = tutorCountryKeys.has(country.toLowerCase());
              return (
                <li key={country}>
                  <button
                    type="button"
                    onClick={() => onSelect(country)}
                    className={linkClass(activeKey === country.toLowerCase(), hasTutors)}
                    title={
                      hasTutors
                        ? t("locationFilter.tutorsIn", "Tutors in {{country}}", { country })
                        : t("locationFilter.browseIn", "Browse tutors in {{country}}", { country })
                    }
                  >
                    {country}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
