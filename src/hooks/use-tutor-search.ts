"use client";

import { useQuery } from "@tanstack/react-query";
import { searchTutors, fetchTutorFacets } from "@/services/tutor-search-api";
import { normalizeTutorFilters, serializeTutorFilters } from "@/lib/tutor-search-utils";
import type { TutorSearchFilters } from "@/types/tutor-search";

export function useTutorFacets() {
  return useQuery({
    queryKey: ["tutor-facets"],
    queryFn: fetchTutorFacets,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });
}

export function useTutorSearch(
  filters: TutorSearchFilters,
  page = 1,
  limit = 24,
  enabled = true,
) {
  const normalized = normalizeTutorFilters(filters);
  const filterKey = serializeTutorFilters(normalized);

  return useQuery({
    queryKey: ["tutors-search", filterKey, page, limit],
    queryFn: () => searchTutors(normalized, page, limit),
    enabled,
    staleTime: 30_000,
  });
}
