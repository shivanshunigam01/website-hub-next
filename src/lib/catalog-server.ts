import { cache } from "react";
import { mapApiCourse, mapApiTutor, type ApiCourse, type ApiTutor } from "@/lib/catalog-map";
import { normalizeApiBase } from "@/lib/site-config";
import { API_BASE } from "@/lib/site-config";
import type { Course, Tutor } from "@/types/catalog";

/** ISR window for homepage catalog (seconds). */
export const HOME_CATALOG_REVALIDATE = 120;

type ApiList<T> = { items?: T[] };
type ApiEnvelope<T> = { success?: boolean; data?: T };

function resolveServerApiBase(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
  if (configured) return normalizeApiBase(configured);
  if (process.env.NODE_ENV === "development") return "http://localhost:4000/api/v1";
  return API_BASE;
}

async function serverGet<T>(path: string, revalidate = HOME_CATALOG_REVALIDATE): Promise<T | null> {
  const base = resolveServerApiBase().replace(/\/$/, "");
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
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

export const fetchHomeCoursesServer = cache(async (limit = 24): Promise<Course[]> => {
  const data = await serverGet<ApiList<ApiCourse>>(`/courses?status=published&limit=${limit}`);
  return (data?.items ?? []).map((c, i) => mapApiCourse(c, i));
});

export const fetchHomeTutorsServer = cache(async (limit = 50): Promise<Tutor[]> => {
  const data = await serverGet<ApiList<ApiTutor>>(`/users/tutors?limit=${limit}`);
  return (data?.items ?? []).map((t, i) => mapApiTutor(t, i));
});
