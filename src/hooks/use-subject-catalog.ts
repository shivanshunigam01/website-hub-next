"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPopularSubjects, fetchSubjects } from "@/services/subjects-api";

export function usePopularSubjects(limit = 12) {
  return useQuery({
    queryKey: ["subjects", "popular", limit],
    queryFn: () => fetchPopularSubjects(limit),
    staleTime: 10 * 60_000,
  });
}

export function useSubjectSearch(query: string, enabled = true, limit = 20) {
  const q = query.trim();
  return useQuery({
    queryKey: ["subjects", "search", q, limit],
    queryFn: () => fetchSubjects(q, limit),
    enabled: enabled && q.length >= 1,
    staleTime: 60_000,
  });
}

export function invalidateSubjectCatalog(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["subjects"] });
}
