"use client";

import { useCallback, useEffect, useState } from "react";
import { useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { api, ApiRequestError } from "@/lib/api";
import { fetchTutorById } from "@/services/tutor-search-api";
import {
  mapApiCourse,
  mapApiCategory,
  mapApiTutor,
  mapCurriculumFromApi,
  type ApiCourse,
  type ApiCategory,
  type ApiTutor,
} from "@/lib/catalog-map";
import type { Course, CategoryItem, Tutor } from "@/types/catalog";
import type { Curriculum } from "@/hooks/use-lms-store";

type Paginated<T> = { items: T[]; pagination?: { total: number } };

const HOME_COURSES_KEY = ["courses", "published", 24] as const;
const HOME_TUTORS_KEY = ["tutors", 50] as const;

async function fetchPublishedCourses(limit: number) {
  const data = await api<Paginated<ApiCourse>>(`/courses?status=published&limit=${limit}`);
  return (data.items ?? []).map((c, i) => mapApiCourse(c, i));
}

async function fetchTutorsList(limit: number) {
  const data = await api<Paginated<ApiTutor>>(`/users/tutors?limit=${limit}`);
  return (data.items ?? []).map((t, i) => mapApiTutor(t, i));
}

/** Warm home catalog cache as soon as the homepage mounts (faster sections/images). */
export function prefetchHomeCatalog(queryClient: QueryClient) {
  void queryClient.prefetchQuery({
    queryKey: HOME_COURSES_KEY,
    queryFn: () => fetchPublishedCourses(24),
    staleTime: 60_000,
  });
  void queryClient.prefetchQuery({
    queryKey: HOME_TUTORS_KEY,
    queryFn: () => fetchTutorsList(50),
    staleTime: 60_000,
  });
}

export function useCourses(options: { status?: string; limit?: number; enabled?: boolean } = {}) {
  const status = options.status ?? "published";
  const limit = options.limit ?? 100;
  const enabled = options.enabled ?? true;
  return useQuery({
    queryKey: ["courses", status, limit],
    enabled,
    queryFn: () => fetchPublishedCourses(limit),
    staleTime: 60_000,
  });
}

export type CourseDetailData = {
  course: Course;
  curriculum: Curriculum;
};

/** Single request for course detail + curriculum (avoids duplicate /courses/:id calls). */
const courseDetailInflight = new Map<string, Promise<CourseDetailData>>();

export function useCourse(courseId: string | undefined) {
  return useQuery({
    queryKey: ["course", courseId],
    enabled: !!courseId,
    queryFn: async () => {
      const id = courseId!;
      let pending = courseDetailInflight.get(id);
      if (!pending) {
        pending = api<ApiCourse>(`/courses/${id}`).then((raw) => ({
          course: mapApiCourse(raw),
          curriculum: mapCurriculumFromApi(id, raw.curriculum ?? []),
        }));
        courseDetailInflight.set(id, pending);
        pending.finally(() => {
          courseDetailInflight.delete(id);
        });
      }
      return pending;
    },
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: (failureCount, error) => {
      if (error instanceof ApiRequestError && error.status >= 400 && error.status < 500) {
        return false;
      }
      return failureCount < 1;
    },
  });
}

export function useCourseCurriculum(courseId: string | undefined) {
  return useQuery({
    queryKey: ["course-curriculum", courseId],
    enabled: !!courseId,
    queryFn: async () => {
      const course = await api<ApiCourse>(`/courses/${courseId}`);
      return mapCurriculumFromApi(courseId!, course.curriculum ?? []);
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const data = await api<Paginated<ApiCategory>>("/categories?limit=50");
      return (data.items ?? []).map(mapApiCategory);
    },
    staleTime: 120_000,
  });
}

export function useTutor(tutorId: string | undefined) {
  return useQuery({
    queryKey: ["tutor", tutorId],
    enabled: !!tutorId,
    queryFn: () => fetchTutorById(tutorId!),
    staleTime: 60_000,
  });
}

export function useTutors(limit = 50) {
  return useQuery({
    queryKey: ["tutors", limit],
    queryFn: () => fetchTutorsList(limit),
    staleTime: 60_000,
  });
}

/** Invalidate course list after LMS edits */
export function useInvalidateCatalog() {
  const qc = useQueryClient();
  return useCallback(() => {
    qc.invalidateQueries({ queryKey: ["courses"] });
    qc.invalidateQueries({ queryKey: ["course"] });
    qc.invalidateQueries({ queryKey: ["course-curriculum"] });
  }, [qc]);
}

export function useCatalogBootstrap() {
  const courses = useCourses();
  const tutors = useTutors();
  const categories = useCategories();
  return {
    courses: courses.data ?? [],
    tutors: tutors.data ?? [],
    categories: categories.data ?? [],
    loading: courses.isLoading || tutors.isLoading || categories.isLoading,
    error: courses.error || tutors.error || categories.error,
    refetch: () => {
      courses.refetch();
      tutors.refetch();
      categories.refetch();
    },
  };
}

/** Categories with "All" for filters */
export function useCategoryFilters(): CategoryItem[] {
  const { data } = useCategories();
  const all: CategoryItem = { id: "all", name: "All", icon: "Sparkles", subcategories: [] };
  return [all, ...(data ?? [])];
}

export function useCourseLoader(courseId: string) {
  const [course, setCourse] = useState<Course | null>(null);
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const raw = await api<ApiCourse>(`/courses/${courseId}`);
        if (cancelled) return;
        setCourse(mapApiCourse(raw));
        setCurriculum(mapCurriculumFromApi(courseId, raw.curriculum ?? []));
        setError(null);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load course");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  return { course, curriculum, loading, error };
}
