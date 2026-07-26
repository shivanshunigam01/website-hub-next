"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, ChevronsUpDown, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BROWSE_COUNTRIES } from "@/data/tutor-locations";
import { cn } from "@/lib/utils";

const ALL_VALUE = "__all__";
const ONLINE_VALUE = "online";

type Props = {
  value: string;
  onChange: (value: string) => void;
  extraLocations?: string[];
  loading?: boolean;
  className?: string;
  variant?: "default" | "hero";
};

export function LocationFilterCombobox({
  value,
  onChange,
  extraLocations = [],
  loading,
  className,
  variant = "default",
}: Props) {
  const { t } = useTranslation("common");
  const [open, setOpen] = useState(false);
  const isHero = variant === "hero";

  const displayLabel = (locValue: string): string => {
    if (locValue === ALL_VALUE || !locValue) return t("tutorJobs.allLocations");
    if (locValue.toLowerCase() === ONLINE_VALUE) return t("tutorsPage.titleOnline");
    return locValue;
  };

  const regionOptions = useMemo(() => {
    const countryKeys = new Set(BROWSE_COUNTRIES.map((c) => c.toLowerCase()));
    const seen = new Set<string>();
    const list: string[] = [];
    for (const loc of extraLocations) {
      const trimmed = loc?.trim();
      if (!trimmed) continue;
      const key = trimmed.toLowerCase();
      if (key === ONLINE_VALUE || countryKeys.has(key) || seen.has(key)) continue;
      seen.add(key);
      list.push(trimmed);
    }
    return list.sort((a, b) => a.localeCompare(b));
  }, [extraLocations]);

  const selectedLabel = loading
    ? t("locationFilter.loading", "Loading locations…")
    : displayLabel(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant={isHero ? "ghost" : "outline"}
          role="combobox"
          aria-expanded={open}
          aria-label={t("locationFilter.searchAria", "Search location")}
          className={cn(
            "relative w-full justify-between ps-9 font-normal",
            isHero
              ? "h-12 border-0 bg-transparent shadow-none hover:bg-transparent"
              : "h-10",
            className,
          )}
        >
          <MapPin className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <span className="truncate text-left text-sm">{selectedLabel}</span>
          <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(100vw-2rem,22rem)] p-0" align="start">
        <Command>
          <CommandInput
            placeholder={t("locationFilter.placeholder", "Search country or city…")}
          />
          <CommandList className="max-h-[min(60vh,320px)]">
            <CommandEmpty>{t("locationFilter.noResults", "No location found.")}</CommandEmpty>

            <CommandGroup heading={t("locationFilter.quickPicks", "Quick picks")}>
              <CommandItem
                value="all locations worldwide"
                onSelect={() => {
                  onChange(ALL_VALUE);
                  setOpen(false);
                }}
              >
                <Check className={cn("h-4 w-4", value === ALL_VALUE ? "opacity-100" : "opacity-0")} />
                {t("tutorJobs.allLocations")}
              </CommandItem>
              <CommandItem
                value="online tutors remote"
                onSelect={() => {
                  onChange(ONLINE_VALUE);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "h-4 w-4",
                    value.toLowerCase() === ONLINE_VALUE ? "opacity-100" : "opacity-0",
                  )}
                />
                {t("tutorsPage.titleOnline")}
              </CommandItem>
            </CommandGroup>

            <CommandGroup heading={t("stats.countries")}>
              {BROWSE_COUNTRIES.map((country) => (
                <CommandItem
                  key={country}
                  value={country}
                  onSelect={() => {
                    onChange(country);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "h-4 w-4",
                      value.toLowerCase() === country.toLowerCase() ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {country}
                </CommandItem>
              ))}
            </CommandGroup>

            {regionOptions.length > 0 ? (
              <CommandGroup heading={t("locationFilter.citiesRegions", "Cities & regions")}>
                {regionOptions.map((loc) => (
                  <CommandItem
                    key={loc}
                    value={loc}
                    onSelect={() => {
                      onChange(loc);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "h-4 w-4",
                        value.toLowerCase() === loc.toLowerCase() ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {loc}
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export { ALL_VALUE as LOCATION_ALL_VALUE, ONLINE_VALUE as LOCATION_ONLINE_VALUE };
