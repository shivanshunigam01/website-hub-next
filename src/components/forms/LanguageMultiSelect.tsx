"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TUTOR_LANGUAGES } from "@/data/requirement-form";
import { cn } from "@/lib/utils";

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  className?: string;
};

export function LanguageMultiSelect({ value, onChange, className }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const selected = new Set(value.map((v) => v.toLowerCase()));
    return TUTOR_LANGUAGES.filter((lang) => {
      if (selected.has(lang.toLowerCase())) return false;
      if (!q) return true;
      return lang.toLowerCase().includes(q);
    }).slice(0, 40);
  }, [query, value]);

  const add = (lang: string) => {
    if (value.some((v) => v.toLowerCase() === lang.toLowerCase())) return;
    onChange([...value, lang]);
    setQuery("");
  };

  const remove = (lang: string) => {
    onChange(value.filter((v) => v !== lang));
  };

  return (
    <div className={cn("relative", className)}>
      <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-md border bg-background px-2 py-1.5">
        {value.map((lang) => (
          <Badge key={lang} variant="secondary" className="gap-1 font-normal">
            {lang}
            <button type="button" aria-label={`Remove ${lang}`} onClick={() => remove(lang)}>
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 150)}
          placeholder={value.length ? "Add language…" : "Search languages…"}
          className="h-7 min-w-[8rem] flex-1 border-0 px-1 shadow-none focus-visible:ring-0"
        />
      </div>
      {open && filtered.length > 0 ? (
        <ul className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-lg border bg-popover p-1 text-sm shadow-lg">
          {filtered.map((lang) => (
            <li key={lang}>
              <button
                type="button"
                className="w-full rounded-md px-2 py-1.5 text-start hover:bg-accent"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => add(lang)}
              >
                {lang}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
