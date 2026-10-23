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

export function tutorSearchToUrl(search: TutorSearchFilters): Record<string, string | undefined> {
  return {
    q: search.q || search.subject || undefined,
    subject: search.subject || undefined,
    location: search.location || undefined,
    country: search.country || undefined,
    city: search.city || undefined,
    mode: search.mode && search.mode !== "all" ? search.mode : undefined,
    online:
      search.mode === "online" ? "true" : search.mode === "in-person" ? "false" : undefined,
    homeTuition: search.homeTuition ? "true" : undefined,
    minExperience:
      search.minExperience && search.minExperience > 0 ? String(search.minExperience) : undefined,
    verified: search.verified ? "true" : undefined,
    minRating: search.minRating && search.minRating > 0 ? String(search.minRating) : undefined,
    minPrice: search.minPrice && search.minPrice > 0 ? String(search.minPrice) : undefined,
    maxPrice: search.maxPrice != null && search.maxPrice < 100 ? String(search.maxPrice) : undefined,
    sortBy: search.sortBy !== "rating" ? search.sortBy : undefined,
  };
}
