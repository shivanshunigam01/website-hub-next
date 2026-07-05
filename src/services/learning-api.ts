import { api } from "@/lib/api";

export type ApiEnrollment = {
  id: string;
  courseId: string;
  status: string;
  enrolledAt: string;
  completedAt?: string;
  progressPercent: number;
  completedLessonIds: string[];
  course?: {
    id: string;
    title: string;
    instructorName?: string;
    gradient?: string;
  };
  certificate?: {
    id: string;
    serial: string;
    studentName: string;
    courseTitle: string;
    instructor: string;
    issuedAt: string;
  } | null;
};

export type ApiCertificate = {
  id: string;
  enrollmentId?: string;
  courseId?: string;
  studentName: string;
  courseTitle: string;
  instructor: string;
  serial: string;
  issuedAt: string;
};

export type ApiReview = {
  id: string;
  studentName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type ReviewSummary = { rating: number; count: number };

export async function enrollInCourse(courseId: string) {
  return api<ApiEnrollment>("/enrollments", {
    method: "POST",
    body: JSON.stringify({ courseId }),
  });
}

export async function fetchMyEnrollments() {
  const data = await api<{ items: ApiEnrollment[] }>("/enrollments/me");
  return data.items ?? [];
}

export async function fetchEnrollmentForCourse(courseId: string) {
  return api<ApiEnrollment | null>(`/enrollments/course/${courseId}`);
}

export async function toggleLessonProgress(
  enrollmentId: string,
  lessonId: string,
  completed: boolean,
  moduleId?: string,
) {
  return api<ApiEnrollment>(`/enrollments/${enrollmentId}/progress`, {
    method: "POST",
    body: JSON.stringify({ lessonId, moduleId, completed }),
  });
}

export async function fetchMyCertificates() {
  const data = await api<{ items: ApiCertificate[] }>("/certificates/me");
  return data.items ?? [];
}

export async function fetchCourseReviews(courseId: string) {
  const data = await api<{ items: ApiReview[] }>(
    `/reviews?courseId=${courseId}&targetType=course&limit=50`,
  );
  return data.items ?? [];
}

export async function fetchTutorReviews(tutorId: string) {
  const data = await api<{ items: ApiReview[] }>(
    `/reviews?tutorId=${tutorId}&targetType=tutor&limit=50`,
  );
  return data.items ?? [];
}

export async function fetchReviewSummary(params: { courseId?: string; tutorId?: string }) {
  const q = new URLSearchParams();
  if (params.courseId) q.set("courseId", params.courseId);
  if (params.tutorId) q.set("tutorId", params.tutorId);
  return api<ReviewSummary>(`/reviews/summary?${q}`);
}

export async function submitReview(body: {
  courseId?: string;
  tutorId?: string;
  targetType?: "course" | "tutor";
  rating: number;
  text: string;
}) {
  return api<ApiReview>("/reviews", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function fetchCourseEnrollmentsForTeacher(courseId: string) {
  const data = await api<{ items: (ApiEnrollment & { studentName?: string; studentEmail?: string })[] }>(
    `/enrollments/course/${courseId}/all`,
  );
  return data.items ?? [];
}
