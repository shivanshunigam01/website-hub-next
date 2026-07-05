import { api } from "@/lib/api";
import type {
  AdminApproveApplicationResult,
  CreateJobApplicationPayload,
  JobApplication,
} from "@/types/proposal";

export async function fetchMyJobApplications(): Promise<JobApplication[]> {
  const data = await api<{ items: JobApplication[] }>("/proposals/me");
  return data.items ?? [];
}

export async function fetchMyApplicationForJob(requirementId: string): Promise<JobApplication | null> {
  return api<JobApplication | null>(`/proposals/requirement/${encodeURIComponent(requirementId)}`);
}

export async function submitJobApplication(payload: CreateJobApplicationPayload): Promise<JobApplication> {
  return api<JobApplication>("/proposals", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchAdminJobApplications(status = "pending", q = "") {
  const p = new URLSearchParams();
  if (status && status !== "all") p.set("status", status);
  if (q.trim()) p.set("q", q.trim());
  p.set("limit", "100");
  return api<{ items: JobApplication[]; pagination?: { total: number } }>(
    `/admin/job-applications?${p.toString()}`,
  );
}

export async function approveJobApplicationAdmin(id: string, adminRemark = "") {
  return api<AdminApproveApplicationResult>(`/admin/job-applications/${id}/approve`, {
    method: "PATCH",
    body: JSON.stringify({ adminRemark }),
  });
}

export async function rejectJobApplicationAdmin(id: string, adminRemark: string) {
  return api<JobApplication>(`/admin/job-applications/${id}/reject`, {
    method: "PATCH",
    body: JSON.stringify({ adminRemark }),
  });
}
