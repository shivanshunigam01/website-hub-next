"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { GraduationCap, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSubjectSearch, invalidateSubjectCatalog } from "@/hooks/use-subject-catalog";
import { ensureSubject } from "@/services/subjects-api";
import { isValidSubjectName, normalizeSubjectName } from "@/lib/subject-name";
import { formatApiErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  showIcon?: boolean;
  /** Extra names merged into suggestions (e.g. from tutor facets) */
  extraOptions?: string[];
};

export function SubjectAutocomplete({
  value,
  onChange,
  placeholder = "Subject or skill (e.g. Mathematics, Python)",
  className,
  inputClassName,
  showIcon = true,
  extraOptions = [],
}: Props) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [debounced, setDebounced] = useState(value);
  const [ensuring, setEnsuring] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), 250);
    return () => window.clearTimeout(t);
  }, [value]);

  const { data: matches = [], isFetching } = useSubjectSearch(debounced, open && debounced.length >= 1);

  const normalizedValue = normalizeSubjectName(value);
  const hasExactMatch = useMemo(() => {
    const key = normalizedValue.toLowerCase();
    if (!key) return false;
    return (
      matches.some((m) => m.name.toLowerCase() === key) ||
      extraOptions.some((n) => n.toLowerCase() === key)
    );
  }, [matches, extraOptions, normalizedValue]);

  const canAddNew =
    normalizedValue.length >= 2 &&
    !hasExactMatch &&
    isValidSubjectName(normalizedValue) &&
    !isFetching;

  const suggestions = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const name of [...matches.map((m) => m.name), ...extraOptions]) {
      const key = name.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        out.push(name);
      }
    }
    return out.slice(0, 25);
  }, [matches, extraOptions]);

  async function commitNewSubject(name: string) {
    const trimmed = normalizeSubjectName(name);
    if (!trimmed || !isValidSubjectName(trimmed)) return;

    setEnsuring(true);
    try {
      const subject = await ensureSubject(trimmed);
      invalidateSubjectCatalog(queryClient);
      onChange(subject.name);
      setOpen(false);
    } catch (err) {
      toast.error(formatApiErrorMessage(err, "Could not add subject"));
    } finally {
      setEnsuring(false);
    }
  }

  async function handleBlur() {
    if (!canAddNew || ensuring) return;
    await commitNewSubject(normalizedValue);
  }

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const showDropdown = open && debounced.length >= 1 && (suggestions.length > 0 || canAddNew);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      {showIcon ? (
        <GraduationCap className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      ) : null}
      <Input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          window.setTimeout(() => {
            void handleBlur();
          }, 150);
        }}
        placeholder={placeholder}
        list={suggestions.length ? listId : undefined}
        autoComplete="off"
        className={cn(showIcon && "ps-10", inputClassName)}
        aria-autocomplete="list"
        aria-expanded={showDropdown}
        disabled={ensuring}
      />
      {suggestions.length > 0 ? (
        <datalist id={listId}>
          {suggestions.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      ) : null}
      {showDropdown ? (
        <ul
          className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-lg border bg-popover p-1 text-sm shadow-lg"
          role="listbox"
        >
          {canAddNew ? (
            <li>
              <button
                type="button"
                role="option"
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-start text-primary hover:bg-accent"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => void commitNewSubject(normalizedValue)}
                disabled={ensuring}
              >
                <Plus className="h-3.5 w-3.5 shrink-0" />
                Add &quot;{normalizedValue}&quot;
              </button>
            </li>
          ) : null}
          {suggestions.map((name) => (
            <li key={name}>
              <button
                type="button"
                role="option"
                className="flex w-full rounded-md px-3 py-2 text-start hover:bg-accent"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(name);
                  setOpen(false);
                }}
              >
                {name}
              </button>
            </li>
          ))}
          {isFetching ? (
            <li className="px-3 py-1 text-xs text-muted-foreground">Searching…</li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
