"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import type { Certificate } from "@/types/learning";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useApp } from "@/hooks/use-app";
import {
  enrollInCourse,
  fetchMyEnrollments,
  fetchEnrollmentForCourse,
  toggleLessonProgress,
  fetchMyCertificates,
  fetchCourseReviews,
  fetchTutorReviews,
  fetchReviewSummary,
  submitReview,
  type ApiEnrollment,
  type ApiCertificate,
  type ApiReview,
} from "@/services/learning-api";
import { formatApiErrorMessage } from "@/lib/api";
import { toast } from "sonner";

function mapCert(c: ApiCertificate): Certificate {
  return {
    id: c.id,
    enrollmentId: c.enrollmentId,
    courseId: c.courseId,
    courseTitle: c.courseTitle,
    studentName: c.studentName,
    instructor: c.instructor,
    issuedAt: c.issuedAt,
    serial: c.serial,
  };
}

function certFromEnrollment(e: ApiEnrollment): Certificate | null {
  if (!e.certificate) return null;
  return {
    id: e.certificate.id,
    enrollmentId: e.id,
    courseId: e.courseId,
    courseTitle: e.certificate.courseTitle,
    studentName: e.certificate.studentName,
    instructor: e.certificate.instructor,
    issuedAt: e.certificate.issuedAt,
    serial: e.certificate.serial,
  };
}

type LearningContext = {
  enrollments: ApiEnrollment[];
  certificates: Certificate[];
  loading: boolean;
  refresh: () => void;
  enroll: (courseId: string) => Promise<ApiEnrollment | null>;
  getEnrollment: (courseId: string) => ApiEnrollment | undefined;
  toggleLesson: (enrollmentId: string, lessonId: string, completed: boolean, moduleId?: string) => Promise<void>;
};

const Ctx = createContext<LearningContext | null>(null);

export function LearningProvider({ children }: { children: ReactNode }) {
  const { user } = useApp();
  const qc = useQueryClient();
  const isStudent = !!user && user.role === "student";

  const enrollmentsQuery = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: fetchMyEnrollments,
    enabled: isStudent,
    staleTime: 30_000,
  });

  const certificatesQuery = useQuery({
    queryKey: ["my-certificates"],
    queryFn: async () => (await fetchMyCertificates()).map(mapCert),
    enabled: isStudent,
    staleTime: 60_000,
  });

  const refresh = useCallback(() => {
    qc.invalidateQueries({ queryKey: ["my-enrollments"] });
    qc.invalidateQueries({ queryKey: ["my-certificates"] });
    qc.invalidateQueries({ queryKey: ["enrollment-course"] });
    qc.invalidateQueries({ queryKey: ["course-reviews"] });
    qc.invalidateQueries({ queryKey: ["tutor-reviews"] });
    qc.invalidateQueries({ queryKey: ["review-summary"] });
    qc.invalidateQueries({ queryKey: ["courses"] });
    qc.invalidateQueries({ queryKey: ["course"] });
    qc.invalidateQueries({ queryKey: ["tutors"] });
    qc.invalidateQueries({ queryKey: ["tutor"] });
  }, [qc]);

  const enroll = useCallback(
    async (courseId: string) => {
      try {
        const en = await enrollInCourse(courseId);
        qc.setQueryData<ApiEnrollment[]>(["my-enrollments"], (prev) => {
          const list = prev ?? [];
          if (list.some((e) => e.courseId === courseId)) {
            return list.map((e) => (e.courseId === courseId ? en : e));
          }
          return [en, ...list];
        });
        qc.setQueryData(["enrollment-course", courseId], en);
        refresh();
        return en;
      } catch (e) {
        toast.error(formatApiErrorMessage(e, "Could not enrol"));
        return null;
      }
    },
    [qc, refresh],
  );

  const toggleLesson = useCallback(
    async (enrollmentId: string, lessonId: string, completed: boolean, moduleId?: string) => {
      try {
        const updated = await toggleLessonProgress(enrollmentId, lessonId, completed, moduleId);
        qc.setQueryData<ApiEnrollment[]>(["my-enrollments"], (prev) =>
          (prev ?? []).map((e) => (e.id === enrollmentId ? updated : e)),
        );
        qc.setQueryData(["enrollment-course", updated.courseId], updated);
        if (updated.certificate) {
          qc.invalidateQueries({ queryKey: ["my-certificates"] });
        }
      } catch (e) {
        toast.error(formatApiErrorMessage(e, "Could not update progress"));
      }
    },
    [qc],
  );

  const value = useMemo<LearningContext>(
    () => ({
      enrollments: enrollmentsQuery.data ?? [],
      certificates: certificatesQuery.data ?? [],
      loading: enrollmentsQuery.isLoading,
      refresh,
      enroll,
      getEnrollment: (courseId) =>
        (enrollmentsQuery.data ?? []).find((e) => e.courseId === courseId),
      toggleLesson,
    }),
    [enrollmentsQuery.data, certificatesQuery.data, enrollmentsQuery.isLoading, refresh, enroll, toggleLesson],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLearning() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLearning must be used inside LearningProvider");
  return ctx;
}

/** Course page: enrollment + reviews for one course */
export function useCourseLearning(courseId: string) {
  const { user } = useApp();
  const learning = useLearning();
  const isStudent = !!user && user.role === "student";

  const enrollmentQuery = useQuery({
    queryKey: ["enrollment-course", courseId],
    queryFn: () => fetchEnrollmentForCourse(courseId),
    enabled: isStudent && !!courseId,
  });

  const enrollment =
    enrollmentQuery.data ??
    learning.getEnrollment(courseId) ??
    null;

  const reviewsQuery = useQuery({
    queryKey: ["course-reviews", courseId],
    queryFn: () => fetchCourseReviews(courseId),
    enabled: !!courseId,
  });

  const summaryQuery = useQuery({
    queryKey: ["review-summary", "course", courseId],
    queryFn: () => fetchReviewSummary({ courseId }),
    enabled: !!courseId,
  });

  const certificate = enrollment ? certFromEnrollment(enrollment) : null;

  const progressPct = enrollment?.progressPercent ?? 0;

  const isLessonDone = useCallback(
    (lessonId: string) => enrollment?.completedLessonIds?.includes(lessonId) ?? false,
    [enrollment],
  );

  const toggleLesson = useCallback(
    async (lessonId: string, moduleId?: string) => {
      if (!enrollment) return;
      const done = enrollment.completedLessonIds.includes(lessonId);
      await learning.toggleLesson(enrollment.id, lessonId, !done, moduleId);
      enrollmentQuery.refetch();
    },
    [enrollment, learning, enrollmentQuery],
  );

  const enroll = useCallback(async () => {
    const en = await learning.enroll(courseId);
    enrollmentQuery.refetch();
    return en;
  }, [learning, courseId, enrollmentQuery]);

  return {
    enrollment,
    certificate,
    progressPct,
    isLessonDone,
    toggleLesson,
    enroll,
    reviews: reviewsQuery.data ?? [],
    summary: summaryQuery.data ?? { rating: 0, count: 0 },
    reviewsLoading: reviewsQuery.isLoading,
    refetchEnrollment: enrollmentQuery.refetch,
  };
}

export function useTutorReviews(tutorId: string) {
  const reviewsQuery = useQuery({
    queryKey: ["tutor-reviews", tutorId],
    queryFn: () => fetchTutorReviews(tutorId),
    enabled: !!tutorId,
  });
  const summaryQuery = useQuery({
    queryKey: ["review-summary", "tutor", tutorId],
    queryFn: () => fetchReviewSummary({ tutorId }),
    enabled: !!tutorId,
  });
  return {
    reviews: reviewsQuery.data ?? [],
    summary: summaryQuery.data ?? { rating: 0, count: 0 },
    loading: reviewsQuery.isLoading,
  };
}

export function useSubmitReview() {
  const qc = useQueryClient();
  return useCallback(
    async (body: Parameters<typeof submitReview>[0]) => {
      const review = await submitReview(body);
      if (body.courseId) {
        qc.invalidateQueries({ queryKey: ["course-reviews", body.courseId] });
        qc.invalidateQueries({ queryKey: ["review-summary", "course", body.courseId] });
        qc.invalidateQueries({ queryKey: ["course", body.courseId] });
        qc.invalidateQueries({ queryKey: ["courses"] });
      }
      if (body.tutorId) {
        qc.invalidateQueries({ queryKey: ["tutor-reviews", body.tutorId] });
        qc.invalidateQueries({ queryKey: ["review-summary", "tutor", body.tutorId] });
        qc.invalidateQueries({ queryKey: ["tutor", body.tutorId] });
        qc.invalidateQueries({ queryKey: ["tutors"] });
      }
      return review;
    },
    [qc],
  );
}

export type { ApiReview };
