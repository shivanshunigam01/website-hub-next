import { api } from "@/lib/api";
import { mapApiTutor, type ApiTutor } from "@/lib/catalog-map";
import type { Tutor } from "@/types/catalog";

export async function fetchSavedTutors(): Promise<Tutor[]> {
  const data = await api<{ items: ApiTutor[] } | ApiTutor[]>("/users/me/saved-tutors");
  const items = Array.isArray(data) ? data : (data.items ?? []);
  return items.map((t, i) => mapApiTutor(t, i));
}

export async function saveTutor(tutorId: string) {
  return api(`/users/me/saved-tutors/${tutorId}`, { method: "POST" });
}

export async function unsaveTutor(tutorId: string) {
  return api(`/users/me/saved-tutors/${tutorId}`, { method: "DELETE" });
}
