import { api, apiPublic } from "@/lib/api";
import type {
  Workshop,
  WorkshopDetail,
  WorkshopListResponse,
  WorkshopRequestPayload,
} from "@/types/workshop";

export async function fetchPublicWorkshops(params?: {
  category?: string;
  mode?: string;
  pricing?: "free" | "paid";
  page?: number;
  limit?: number;
}) {
  const qs = new URLSearchParams();
  if (params?.category) qs.set("category", params.category);
  if (params?.mode) qs.set("mode", params.mode);
  if (params?.pricing) qs.set("pricing", params.pricing);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  const q = qs.toString();
  return apiPublic<WorkshopListResponse>(`/workshops${q ? `?${q}` : ""}`);
}

export async function fetchWorkshopDetail(id: string, useAuth = false) {
  if (useAuth) {
    return api<WorkshopDetail>(`/workshops/${id}`);
  }
  return apiPublic<WorkshopDetail>(`/workshops/${id}`);
}

export async function registerForWorkshop(id: string) {
  return api<{ workshopId: string; registered: boolean; enrolledStudents: number; spotsLeft: number }>(
    `/workshops/${id}/register`,
    { method: "POST" },
  );
}

export async function fetchMyWorkshops() {
  return api<{ items: Workshop[] }>("/workshops/my-workshops");
}

export async function requestWorkshop(payload: WorkshopRequestPayload) {
  return api<Workshop>("/workshops/request", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchAdminWorkshops(status?: string) {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  return api<WorkshopListResponse>(`/admin/workshops${qs}`);
}

export async function fetchAdminWorkshopDetail(id: string) {
  return api<WorkshopDetail>(`/admin/workshops/${id}`);
}

export async function approveWorkshop(id: string) {
  return api<Workshop>(`/admin/workshops/${id}/approve`, { method: "PATCH" });
}

export async function rejectWorkshop(id: string, adminRemark: string) {
  return api<Workshop>(`/admin/workshops/${id}/reject`, {
    method: "PATCH",
    body: JSON.stringify({ adminRemark }),
  });
}

export async function updateWorkshopStatus(id: string, status: "approved" | "inactive") {
  return api<Workshop>(`/admin/workshops/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
