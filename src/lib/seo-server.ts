import { API_BASE } from "@/lib/site-config";

type ApiList<T> = { items?: T[] };
type ApiEnvelope<T> = { success?: boolean; data?: T };

async function serverGet<T>(path: string, revalidate = 3600): Promise<T | null> {
  const url = `${API_BASE.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
  try {
    const res = await fetch(url, { next: { revalidate } });
    if (!res.ok) return null;
    const json = (await res.json()) as ApiEnvelope<T> | T;
    if (json && typeof json === "object" && "data" in json && (json as ApiEnvelope<T>).data !== undefined) {
      return (json as ApiEnvelope<T>).data as T;
    }
    return json as T;
  } catch {
    return null;
  }
}

export type TutorSeo = {
  id: string;
  name?: string;
  teacherProfile?: {
    bio?: string;
    subjects?: string[];
    city?: string;
    country?: string;
    publicLocation?: string;
  };
};

export type CourseSeo = {
  id: string;
  title?: string;
  description?: string;
  price?: number;
  status?: string;
};

export async function fetchTutorForSeo(id: string): Promise<TutorSeo | null> {
  const data = await serverGet<TutorSeo & { _id?: string }>(`/tutors/${id}`);
  if (!data) return null;
  const tid = data.id || (data._id ? String(data._id) : "");
  if (!tid) return null;
  return { ...data, id: tid };
}

export async function fetchCourseForSeo(id: string): Promise<CourseSeo | null> {
  const data = await serverGet<CourseSeo>(`/courses/${id}`);
  if (!data) return null;
  const cid = data.id || String((data as { _id?: string })._id);
  if (!cid || data.status !== "published") return null;
  return { ...data, id: cid };
}

export async function fetchSitemapTutorIds(limit = 250): Promise<string[]> {
  const data = await serverGet<ApiList<{ id?: string }>>(`/tutors?limit=${Math.min(limit, 50)}&page=1`, 7200);
  const items = data?.items ?? [];
  return items.map((t) => t.id || "").filter(Boolean);
}

export async function fetchSitemapCourseIds(limit = 250): Promise<string[]> {
  const data = await serverGet<ApiList<{ id?: string; status?: string }>>(
    `/courses?limit=${Math.min(limit, 50)}&status=published`,
    7200,
  );
  const items = data?.items ?? [];
  return items
    .filter((c) => c.status === "published" || !c.status)
    .map((c) => c.id || "")
    .filter(Boolean);
}
