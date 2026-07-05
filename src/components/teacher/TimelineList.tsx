"use client";

import { Briefcase, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

export type TimelineItem = {
  id?: string;
  title: string;
  subtitle: string;
  startDate?: string | null;
  endDate?: string | null;
  description?: string;
};

function formatPeriod(start?: string | null, end?: string | null) {
  const fmt = (v?: string | null) => {
    if (!v) return null;
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return v;
    return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
  };
  const s = fmt(start);
  const e = end ? fmt(end) : "Present";
  if (!s && !e) return "";
  if (!s) return e || "";
  return `${s} – ${e}`;
}

type Props = {
  items: TimelineItem[];
  emptyMessage: string;
  icon?: "experience" | "education";
};

export function TimelineList({ items, emptyMessage, icon = "experience" }: Props) {
  const Icon = icon === "education" ? GraduationCap : Briefcase;

  if (!items.length) {
    return <p className="text-sm italic text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <ol className="relative space-y-0 border-l border-border pl-6">
      {items.map((item, index) => (
        <li key={item.id || `${item.title}-${index}`} className={cn("relative pb-6 last:pb-0")}>
          <span className="absolute -left-[1.65rem] grid h-7 w-7 place-items-center rounded-full border bg-card text-primary shadow-sm">
            <Icon className="h-3.5 w-3.5" />
          </span>
          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold leading-snug">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.subtitle}</p>
              </div>
              {formatPeriod(item.startDate, item.endDate) && (
                <span className="shrink-0 text-xs font-medium text-primary">
                  {formatPeriod(item.startDate, item.endDate)}
                </span>
              )}
            </div>
            {item.description?.trim() && (
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
