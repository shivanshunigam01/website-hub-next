import { api, apiPublic } from "@/lib/api";

export type SubjectItem = {
  id: string;
  name: string;
  slug: string;
  group: string;
  aliases?: string[];
  isPopular?: boolean;
  isActive?: boolean;
  sortOrder?: number;
};

type SubjectListResponse = {
  items: SubjectItem[];
  pagination?: { total: number; page: number; limit: number; totalPages?: number };
};

export async function fetchSubjects(query = "", limit = 20): Promise<SubjectItem[]> {
  const p = new URLSearchParams();
  if (query.trim()) p.set("q", query.trim());
  p.set("limit", String(limit));
  p.set("page", "1");
  const data = await apiPublic<SubjectListResponse>(`/subjects?${p.toString()}`);
  return data.items ?? [];
}

export async function fetchPopularSubjects(limit = 12): Promise<SubjectItem[]> {
  const data = await apiPublic<{ items: SubjectItem[] }>(`/subjects/popular?limit=${limit}`);
  return data.items ?? [];
}

/** Add or return an existing subject when the user enters a valid new name. */
export async function ensureSubject(name: string): Promise<SubjectItem> {
  return apiPublic<SubjectItem>("/subjects/ensure", {
    method: "POST",
    body: JSON.stringify({ name: name.trim() }),
  });
}

export type AdminSubjectFilters = {
  q?: string;
  group?: string;
  status?: "active" | "inactive" | "all";
  page?: number;
  limit?: number;
};

export async function fetchAdminSubjects(filters: AdminSubjectFilters = {}): Promise<SubjectListResponse> {
  const p = new URLSearchParams();
  if (filters.q?.trim()) p.set("q", filters.q.trim());
  if (filters.group) p.set("group", filters.group);
  if (filters.status) p.set("status", filters.status);
  p.set("page", String(filters.page ?? 1));
  p.set("limit", String(filters.limit ?? 50));
  return api<SubjectListResponse>(`/admin/subjects?${p.toString()}`);
}

export async function updateSubjectStatus(id: string, isActive: boolean): Promise<SubjectItem> {
  return api<SubjectItem>(`/admin/subjects/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
}

export async function updateSubject(
  id: string,
  body: Partial<Pick<SubjectItem, "name" | "group" | "isPopular" | "sortOrder" | "isActive"> & { aliases?: string[] }>,
): Promise<SubjectItem> {
  return api<SubjectItem>(`/subjects/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}
