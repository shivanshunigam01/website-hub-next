"use client";

import { useMemo } from "react";
import { SubjectAutocomplete } from "@/components/tutors/SubjectAutocomplete";
import { usePopularSubjects } from "@/hooks/use-subject-catalog";
import { Label } from "@/components/ui/label";

const FALLBACK_POPULAR = [
  "Academic Writing",
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
  "Economics",
  "DBMS",
  "C/C++",
  "HTML",
  "Psychology",
  "NEET",
  "JEE Main",
  "Spoken English",
  "Machine Learning",
  "Data Science",
  "React",
  "Mechanical Engineering",
  "Digital Marketing",
];

type Props = {
  value: string;
  onChange: (value: string) => void;
  exclude?: string[];
  inputId?: string;
  label?: string;
  placeholder?: string;
};

export function TeachingSubjectPicker({
  value,
  onChange,
  exclude = [],
  inputId,
  label = "Subject (one at a time)",
  placeholder = "e.g. Mathematics, Python, NEET",
}: Props) {
  const { data: popularCatalog = [] } = usePopularSubjects(24);

  const quickPicks = useMemo(() => {
    const names = popularCatalog.length
      ? popularCatalog.map((s) => s.name)
      : FALLBACK_POPULAR;
    const excluded = new Set(exclude.map((n) => n.toLowerCase()));
    return names.filter((n) => !excluded.has(n.toLowerCase()));
  }, [popularCatalog, exclude]);

  return (
    <div className="space-y-3">
      {quickPicks.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {quickPicks.map((option) => (
            <button
              key={option}
              type="button"
              className="rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground transition hover:border-primary/40 hover:text-primary"
              onClick={() => onChange(option)}
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}
      <div>
        {label ? <Label htmlFor={inputId}>{label}</Label> : null}
        <SubjectAutocomplete
          className={label ? "mt-1" : undefined}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          showIcon={false}
        />
      </div>
    </div>
  );
}
