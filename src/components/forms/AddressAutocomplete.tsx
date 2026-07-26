"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { AddressSuggestion } from "@/app/api/geolocation/autocomplete/route";

type Props = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (suggestion: AddressSuggestion) => void;
  selected: boolean;
  required?: boolean;
  className?: string;
  placeholder?: string;
};

export function AddressAutocomplete({
  label = "Location",
  value,
  onChange,
  onSelect,
  selected,
  required,
  className,
  placeholder = "Start typing your full address…",
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [hint, setHint] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.trim().length < 2 || selected) {
      setSuggestions([]);
      return;
    }
    const t = window.setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/geolocation/autocomplete?q=${encodeURIComponent(value.trim())}`,
        );
        const data = (await res.json()) as { suggestions?: AddressSuggestion[] };
        setSuggestions(data.suggestions ?? []);
        setOpen(true);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 280);
    return () => window.clearTimeout(t);
  }, [value, selected]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      {label ? <Label>{label}</Label> : null}
      <div className="relative mt-1">
        <MapPin className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value}
          required={required}
          placeholder={placeholder}
          className={cn("ps-9", selected && "bg-emerald-50 dark:bg-emerald-950/30")}
          onChange={(e) => {
            onChange(e.target.value);
            setHint(false);
          }}
          onBlur={() => {
            window.setTimeout(() => {
              if (!selected && value.trim()) setHint(true);
            }, 150);
          }}
          onFocus={() => {
            if (suggestions.length) setOpen(true);
          }}
          autoComplete="off"
        />
        {loading ? (
          <Loader2 className="absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : null}
      </div>
      {hint && !selected ? (
        <p className="mt-1 text-xs text-destructive">
          Please select your location from the suggested options.
        </p>
      ) : null}
      {open && suggestions.length > 0 ? (
        <ul className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-lg border bg-popover p-1 text-sm shadow-lg">
          {suggestions.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                className="flex w-full items-start gap-2 rounded-md px-2 py-2 text-start hover:bg-accent"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onSelect(s);
                  setOpen(false);
                  setHint(false);
                }}
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <span>{s.label}</span>
              </button>
            </li>
          ))}
          <li className="px-2 py-1 text-[10px] text-muted-foreground text-end">powered by Geoapify</li>
        </ul>
      ) : null}
    </div>
  );
}
