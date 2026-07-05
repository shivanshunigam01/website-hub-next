import type { Requirement, RequirementMode, TutorJobsFilters } from "@/types/requirement";

export type TutorJobMode = "all" | "online" | "home";

export function parseTutorJobMode(raw: unknown): TutorJobMode {
  if (raw === "online" || raw === "home") return raw;
  return "all";
}

export function parseJobTypeFilter(raw: unknown): TutorJobsFilters["jobType"] {
  if (raw === "tutoring" || raw === "assignment") return raw;
  return "all";
}

export function filtersFromSearch(search: Record<string, unknown>): TutorJobsFilters {
  return {
    q: typeof search.q === "string" ? search.q : undefined,
    subject: typeof search.subject === "string" ? search.subject : undefined,
    skill: typeof search.skill === "string" ? search.skill : undefined,
    location: typeof search.location === "string" ? search.location : undefined,
    mode: parseTutorJobMode(search.mode),
    jobType: parseJobTypeFilter(search.jobType),
  };
}

export function filterApprovedJobs(requirements: Requirement[], mode: TutorJobMode): Requirement[] {
  const approved = requirements.filter((r) => r.status === "approved");
  if (mode === "all") return approved;
  if (mode === "online") {
    return approved.filter((r) => r.mode === "online" || r.mode === "both");
  }
  return approved.filter((r) => r.mode === "offline" || r.mode === "both");
}

export function jobModeLabel(mode: TutorJobMode): string {
  if (mode === "online") return "Online tutor jobs";
  if (mode === "home") return "Home tutor jobs";
  return "All tutor jobs";
}

export function requirementModeLabel(mode: RequirementMode): string {
  if (mode === "online") return "Online";
  if (mode === "offline") return "Home / in-person";
  return "Online & home";
}

export function jobTypeLabel(jobType: Requirement["jobType"]): string {
  if (jobType === "assignment") return "Assignment help";
  return "Tutoring";
}

export function requirementStatusLabel(status: Requirement["status"]): string {
  if (status === "pending") return "Pending review";
  if (status === "approved") return "Live on tutor jobs";
  if (status === "rejected") return "Rejected";
  if (status === "fulfilled") return "Fulfilled";
  return status;
}

export function requirementStatusClass(status: Requirement["status"]): string {
  if (status === "pending") return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
  if (status === "approved") return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300";
  if (status === "rejected") return "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300";
  return "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300";
}
