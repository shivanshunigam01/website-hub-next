"use client";

import { useMemo, useState } from "react";
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
import { BROWSE_COUNTRIES, ONLINE_LOCATION_LABEL } from "@/data/tutor-locations";
import { cn } from "@/lib/utils";

const ALL_VALUE = "__all__";
const ONLINE_VALUE = "online";

function displayLabel(value: string): string {
  if (value === ALL_VALUE || !value) return "All locations";
  if (value.toLowerCase() === ONLINE_VALUE) return "Online tutors";
  return value;
}

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
  const [open, setOpen] = useState(false);
  const isHero = variant === "hero";

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

  const selectedLabel = loading ? "Loading locations…" : displayLabel(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant={isHero ? "ghost" : "outline"}
          role="combobox"
          aria-expanded={open}
          aria-label="Search location"
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
          <CommandInput placeholder="Search country or city…" />
          <CommandList className="max-h-[min(60vh,320px)]">
            <CommandEmpty>No location found.</CommandEmpty>

            <CommandGroup heading="Quick picks">
              <CommandItem
                value="all locations worldwide"
                onSelect={() => {
                  onChange(ALL_VALUE);
                  setOpen(false);
                }}
              >
                <Check className={cn("h-4 w-4", value === ALL_VALUE ? "opacity-100" : "opacity-0")} />
                All locations
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
                Online tutors
              </CommandItem>
            </CommandGroup>

            <CommandGroup heading="Countries">
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
              <CommandGroup heading="Cities & regions">
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
