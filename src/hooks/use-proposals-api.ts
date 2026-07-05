"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveJobApplicationAdmin,
  fetchAdminJobApplications,
  fetchMyApplicationForJob,
  fetchMyJobApplications,
  rejectJobApplicationAdmin,
  submitJobApplication,
} from "@/services/proposals-api";
import type { CreateJobApplicationPayload } from "@/types/proposal";

export function useMyJobApplications(enabled = true) {
  return useQuery({
    queryKey: ["my-job-applications"],
    queryFn: fetchMyJobApplications,
    enabled,
    refetchInterval: 15000,
  });
}

export function useMyJobApplication(requirementId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ["my-job-application", requirementId],
    queryFn: () => fetchMyApplicationForJob(requirementId!),
    enabled: enabled && !!requirementId,
  });
}

export function useSubmitJobApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateJobApplicationPayload) => submitJobApplication(payload),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["my-job-applications"] });
      qc.invalidateQueries({ queryKey: ["my-job-application", vars.requirementId] });
      qc.invalidateQueries({ queryKey: ["admin-job-applications"] });
    },
  });
}

export function useAdminJobApplications(status = "pending", q = "") {
  return useQuery({
    queryKey: ["admin-job-applications", status, q],
    queryFn: async () => {
      const data = await fetchAdminJobApplications(status, q);
      return data.items ?? [];
    },
    refetchInterval: 8000,
  });
}

export function useApproveJobApplicationAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, adminRemark }: { id: string; adminRemark?: string }) =>
      approveJobApplicationAdmin(id, adminRemark),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-job-applications"] });
      qc.invalidateQueries({ queryKey: ["my-job-applications"] });
    },
  });
}

export function useRejectJobApplicationAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, adminRemark }: { id: string; adminRemark: string }) =>
      rejectJobApplicationAdmin(id, adminRemark),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-job-applications"] });
      qc.invalidateQueries({ queryKey: ["my-job-applications"] });
    },
  });
}
