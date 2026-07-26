"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveRequirementAdmin,
  createRequirement,
  fetchAdminRequirements,
  fetchMyRequirements,
  fetchRequirementById,
  fetchRequirementFacets,
  fetchTutorJobs,
  rejectRequirementAdmin,
} from "@/services/requirements-api";
import type { CreateRequirementPayload, TutorJobsFilters } from "@/types/requirement";

function serializeFilters(filters: TutorJobsFilters): string {
  return JSON.stringify({
    q: filters.q ?? "",
    subject: filters.subject ?? "",
    skill: filters.skill ?? "",
    location: filters.location ?? "",
    mode: filters.mode ?? "all",
    jobType: filters.jobType ?? "all",
    level: filters.level ?? "all",
  });
}

export function useRequirementFacets() {
  return useQuery({
    queryKey: ["requirement-facets"],
    queryFn: fetchRequirementFacets,
    staleTime: 60_000,
  });
}

export function useTutorJobs(filters: TutorJobsFilters, page = 1, limit = 24) {
  const key = serializeFilters(filters);
  return useQuery({
    queryKey: ["tutor-jobs", key, page, limit],
    queryFn: async () => {
      const data = await fetchTutorJobs(filters, page, limit);
      return {
        jobs: data.items ?? [],
        total: data.pagination?.total ?? data.items?.length ?? 0,
        page: data.pagination?.page ?? page,
        limit: data.pagination?.limit ?? limit,
      };
    },
    staleTime: 30_000,
  });
}

export function useRequirementDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["requirement", id],
    enabled: !!id,
    queryFn: () => fetchRequirementById(id!),
    staleTime: 30_000,
  });
}

export function useMyRequirements(enabled = true) {
  return useQuery({
    queryKey: ["my-requirements"],
    queryFn: async () => {
      const data = await fetchMyRequirements();
      return data.items ?? [];
    },
    enabled,
    staleTime: 15_000,
  });
}

export function useCreateRequirement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRequirementPayload) => createRequirement(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-requirements"] });
      qc.invalidateQueries({ queryKey: ["admin-requirements"] });
    },
  });
}

export function useAdminRequirements(status = "pending") {
  return useQuery({
    queryKey: ["admin-requirements", status],
    queryFn: async () => {
      const data = await fetchAdminRequirements(status);
      return data.items ?? [];
    },
    staleTime: 10_000,
  });
}

export function useApproveRequirementAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, adminRemark }: { id: string; adminRemark?: string }) =>
      approveRequirementAdmin(id, adminRemark),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-requirements"] });
      qc.invalidateQueries({ queryKey: ["tutor-jobs"] });
      qc.invalidateQueries({ queryKey: ["requirement-facets"] });
      qc.invalidateQueries({ queryKey: ["my-requirements"] });
    },
  });
}

export function useRejectRequirementAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, adminRemark }: { id: string; adminRemark: string }) =>
      rejectRequirementAdmin(id, adminRemark),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-requirements"] });
      qc.invalidateQueries({ queryKey: ["my-requirements"] });
    },
  });
}
