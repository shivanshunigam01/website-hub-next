import type { TutorSearchFilters } from "@/types/tutor-search";

export const DEFAULT_TUTOR_FILTERS: TutorSearchFilters = {
  q: "",
  subject: "",
  location: "",
  country: "",
  city: "",
  mode: "all",
  homeTuition: false,
  minExperience: 0,
  verified: false,
  minRating: 0,
  minPrice: 0,
  maxPrice: 100,
  sortBy: "rating",
};

/** Stable merge of URL/partial filters into a full filter object. */
export function normalizeTutorFilters(partial?: TutorSearchFilters): TutorSearchFilters {
  return { ...DEFAULT_TUTOR_FILTERS, ...partial };
}

/** Stable string for React deps / query keys. */
export function serializeTutorFilters(filters: TutorSearchFilters): string {
  const f = normalizeTutorFilters(filters);
  return JSON.stringify({
    q: f.q ?? "",
    subject: f.subject ?? "",
    location: f.location ?? "",
    country: f.country ?? "",
    city: f.city ?? "",
    mode: f.mode ?? "all",
    homeTuition: !!f.homeTuition,
    minExperience: f.minExperience ?? 0,
    verified: !!f.verified,
    minRating: f.minRating ?? 0,
    minPrice: f.minPrice ?? 0,
    maxPrice: f.maxPrice ?? 100,
    sortBy: f.sortBy ?? "rating",
  });
}
