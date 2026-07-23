"use client";

import { Link } from "@/lib/navigation";
import { MapPin, BookOpen, Wifi, Home, ClipboardList, ShieldCheck, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Requirement } from "@/types/requirement";
import {
  jobTypeLabel,
  postedByLine,
  requirementModeLabel,
} from "@/lib/tutor-jobs-utils";
import { useCurrency } from "@/hooks/use-currency";
import { cn } from "@/lib/utils";

export function TutorJobCard({ job, className }: { job: Requirement; className?: string }) {
  const { formatLocalizedPrice } = useCurrency();
  const ModeIcon = job.mode === "offline" ? Home : Wifi;

  return (
    <Link
      to="/tutor-jobs/$id"
      params={{ id: job.id }}
      hash="apply"
      className={cn(
        "group block rounded-2xl border bg-card p-5 transition-shadow hover:shadow-md",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="font-display text-lg font-bold leading-snug group-hover:text-primary">
          {job.title}
        </h3>
        <div className="flex shrink-0 flex-wrap gap-1.5">
          {job.jobType === "assignment" && (
            <Badge variant="outline" className="font-normal">
              <ClipboardList className="me-1 h-3 w-3" />
              Assignment
            </Badge>
          )}
          <Badge variant="secondary" className="font-normal">
            {job.subject}
          </Badge>
        </div>
      </div>

      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{job.details}</p>

      {job.skills?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {job.skills.slice(0, 4).map((s) => (
            <Badge key={s} variant="outline" className="text-xs font-normal">
              {s}
            </Badge>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <BookOpen className="h-3.5 w-3.5" />
          {job.level}
        </span>
        <span className="inline-flex items-center gap-1">
          <ModeIcon className="h-3.5 w-3.5" />
          {requirementModeLabel(job.mode)}
        </span>
        {job.city || job.location ? (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {job.city || job.location}
          </span>
        ) : null}
        <span className="inline-flex items-center gap-1 font-medium text-foreground">
          {formatLocalizedPrice(job.budget, job.currency)}/hr
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {jobTypeLabel(job.jobType)} · {postedByLine(job)}
          {job.posterVerified ? (
            <span className="ms-1 inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-3 w-3" />
              Verified
            </span>
          ) : null}
          {" · "}
          {new Date(job.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
          <Send className="h-3 w-3" />
          Apply
        </span>
      </div>
    </Link>
  );
}
