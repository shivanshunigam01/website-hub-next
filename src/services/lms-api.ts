import { api } from "@/lib/api";
import {
  curriculumToApi,
  mapCurriculumFromApi,
  type ApiCourse,
} from "@/lib/catalog-map";
import type { Module } from "@/hooks/use-lms-store";

export async function fetchCourseCurriculum(courseId: string) {
  const raw = await api<ApiCourse>(`/courses/${courseId}`);
  return {
    course: raw,
    curriculum: mapCurriculumFromApi(courseId, raw.curriculum ?? []),
  };
}

export async function saveCourseCurriculum(courseId: string, modules: Module[]) {
  await api(`/courses/${courseId}`, {
    method: "PATCH",
    body: JSON.stringify({ curriculum: curriculumToApi(modules) }),
  });
}

export async function addCourseModule(courseId: string, title: string) {
  await api(`/courses/${courseId}/modules`, {
    method: "POST",
    body: JSON.stringify({ title, order: Date.now(), lessons: [] }),
  });
}
