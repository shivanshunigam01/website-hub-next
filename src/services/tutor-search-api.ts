import { apiPublic } from "@/lib/api";
import { mapApiTutor, type ApiTutor } from "@/lib/catalog-map";
import { normalizeTutorFilters } from "@/lib/tutor-search-utils";
import type { TutorFacets, TutorSearchFilters } from "@/types/tutor-search";

type Paginated<T> = {
  items: T[];
  pagination?: { total: number; page: number; limit: number };
};

export function filtersToQueryParams(filters: TutorSearchFilters, page = 1, limit = 24): string {
  const f = normalizeTutorFilters(filters);
  const p = new URLSearchParams();
  p.set("page", String(page));
  p.set("limit", String(limit));

  const subject = f.subject?.trim();
  const q = f.q?.trim();
  if (subject) p.set("subject", subject);
  else if (q) p.set("q", q);

  if (f.location?.trim()) p.set("location", f.location.trim());
  if (f.country?.trim()) p.set("country", f.country.trim());
  if (f.city?.trim()) p.set("city", f.city.trim());
  if (f.mode === "online") p.set("online", "true");
  if (f.mode === "in-person") p.set("online", "false");
  if (f.homeTuition) p.set("homeTuition", "true");
  if (f.verified) p.set("verified", "true");
  if (f.minRating != null && f.minRating > 0) p.set("minRating", String(f.minRating));
  if (f.minExperience != null && f.minExperience > 0) p.set("minExperience", String(f.minExperience));
  if (f.minPrice != null && f.minPrice > 0) p.set("minPrice", String(f.minPrice));
  if (f.maxPrice != null && f.maxPrice < 100) p.set("maxPrice", String(f.maxPrice));
  if (f.sortBy && f.sortBy !== "rating") p.set("sortBy", f.sortBy);

  return p.toString();
}

export async function searchTutors(filters: TutorSearchFilters, page = 1, limit = 24) {
  const qs = filtersToQueryParams(filters, page, limit);
  const data = await apiPublic<Paginated<ApiTutor>>(`/tutors?${qs}`);
  return {
    tutors: (data.items ?? []).map((t, i) => mapApiTutor(t, i)),
    total: data.pagination?.total ?? data.items?.length ?? 0,
    page: data.pagination?.page ?? page,
    limit: data.pagination?.limit ?? limit,
  };
}

export async function fetchTutorFacets(): Promise<TutorFacets> {
  return apiPublic<TutorFacets>("/tutors/facets");
}

export async function fetchTutorById(tutorId: string) {
  const raw = await apiPublic<ApiTutor>(`/tutors/${tutorId}`);
  return mapApiTutor(raw);
}

/** Authenticated tutor profile APIs */
export { fetchTeacherProfile, saveTeacherProfile } from "@/services/teacher-profile-api";
