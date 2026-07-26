import { api, apiPublic } from "@/lib/api";
import type {
  AdminApproveResult,
  CreateRequirementPayload,
  Requirement,
  RequirementFacets,
  RequirementListResponse,
  TutorJobsFilters,
} from "@/types/requirement";

function jobsQueryParams(filters: TutorJobsFilters, page = 1, limit = 24): string {
  const p = new URLSearchParams();
  p.set("page", String(page));
  p.set("limit", String(limit));
  if (filters.q?.trim()) p.set("q", filters.q.trim());
  if (filters.subject?.trim()) p.set("subject", filters.subject.trim());
  if (filters.skill?.trim()) p.set("skill", filters.skill.trim());
  if (filters.location?.trim()) p.set("location", filters.location.trim());
  if (filters.mode && filters.mode !== "all") p.set("mode", filters.mode);
  if (filters.jobType && filters.jobType !== "all") p.set("jobType", filters.jobType);
  if (filters.level && filters.level !== "all") p.set("level", filters.level);
  return p.toString();
}

export async function fetchTutorJobs(filters: TutorJobsFilters = {}, page = 1, limit = 24) {
  const qs = jobsQueryParams(filters, page, limit);
  return apiPublic<RequirementListResponse>(`/requirements/jobs?${qs}`);
}

export async function fetchRequirementFacets() {
  return apiPublic<RequirementFacets>("/requirements/facets");
}

export async function fetchRequirementById(id: string) {
  const token = typeof window !== "undefined" ? localStorage.getItem("tp_access_token") : null;
  if (token) {
    try {
      return await api<Requirement>(`/requirements/${id}`);
    } catch {
      // fall through to public fetch
    }
  }
  return apiPublic<Requirement>(`/requirements/${id}`);
}

export async function fetchMyRequirements() {
  return api<{ items: Requirement[] }>("/requirements/me");
}

export async function createRequirement(payload: CreateRequirementPayload) {
  return api<Requirement>("/requirements", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchAdminRequirements(status = "pending", page = 1, limit = 50) {
  const qs = new URLSearchParams({
    status,
    page: String(page),
    limit: String(limit),
  });
  return api<RequirementListResponse>(`/admin/requirements?${qs}`);
}

export async function approveRequirementAdmin(id: string, adminRemark = "") {
  return api<AdminApproveResult>(`/admin/requirements/${id}/approve`, {
    method: "PATCH",
    body: JSON.stringify({ adminRemark }),
  });
}

export async function rejectRequirementAdmin(id: string, adminRemark: string) {
  return api<Requirement>(`/admin/requirements/${id}/reject`, {
    method: "PATCH",
    body: JSON.stringify({ adminRemark }),
  });
}
