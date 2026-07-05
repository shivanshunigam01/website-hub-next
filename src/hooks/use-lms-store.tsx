"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "@/lib/api";
import { mapApiCategory, type ApiCategory } from "@/lib/catalog-map";
import { fetchCourseCurriculum, saveCourseCurriculum } from "@/services/lms-api";
import { toast } from "sonner";

/* ---------------- Types ---------------- */

export type LessonType = "video" | "reading" | "quiz" | "assignment";

export type Lesson = {
  id: string;
  title: string;
  type: LessonType;
  duration: string;
};

export type Module = {
  id: string;
  title: string;
  lessons: Lesson[];
};

export type Curriculum = {
  courseId: string;
  modules: Module[];
};

export type Subcategory = {
  id: string;
  name: string;
};

export type Category = {
  id: string;
  name: string;
  icon?: string;
  subcategories: Subcategory[];
};

export type Enrollment = {
  id: string;
  courseId: string;
  studentName: string;
  studentEmail?: string;
  enrolledAt: string;
  completed: string[];
};

export type Review = {
  id: string;
  courseId: string;
  studentName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type Certificate = {
  id: string;
  enrollmentId: string;
  courseId: string;
  courseTitle: string;
  studentName: string;
  instructor: string;
  issuedAt: string;
  serial: string;
};

type CourseMeta = { title: string; instructor: string };

type State = {
  categories: Category[];
  categoriesLoaded: boolean;
  curricula: Record<string, Curriculum>;
  courseMeta: Record<string, CourseMeta>;
  enrollments: Enrollment[];
  reviews: Review[];
  certificates: Certificate[];
};

type Store = State & {
  loadCategories: () => Promise<void>;
  loadCurriculum: (courseId: string) => Promise<Curriculum>;
  addCategory: (name: string) => void;
  deleteCategory: (id: string) => void;
  addSubcategory: (categoryId: string, name: string) => void;
  deleteSubcategory: (categoryId: string, subId: string) => void;
  getCurriculum: (courseId: string) => Curriculum;
  setCurriculum: (courseId: string, modules: Module[]) => void;
  addModule: (courseId: string, title: string) => void;
  updateModule: (courseId: string, moduleId: string, title: string) => void;
  deleteModule: (courseId: string, moduleId: string) => void;
  addLesson: (courseId: string, moduleId: string, lesson: Partial<Lesson>) => void;
  updateLesson: (courseId: string, moduleId: string, lessonId: string, patch: Partial<Lesson>) => void;
  deleteLesson: (courseId: string, moduleId: string, lessonId: string) => void;
  enroll: (courseId: string, student: { name: string; email?: string }) => Enrollment;
  isEnrolled: (courseId: string, studentName?: string) => Enrollment | undefined;
  toggleLesson: (enrollmentId: string, lessonId: string) => void;
  addReview: (r: Omit<Review, "id" | "createdAt">) => void;
  reviewsForCourse: (courseId: string) => Review[];
  averageRating: (courseId: string) => { rating: number; count: number };
  issueCertificate: (enrollmentId: string) => Certificate | null;
  certificatesForStudent: (studentName: string) => Certificate[];
  reset: () => void;
};

const KEY = "tp_lms_store_v1";

function emptyCurriculum(courseId: string): Curriculum {
  return { courseId, modules: [] };
}

function initialState(): State {
  return {
    categories: [],
    categoriesLoaded: false,
    curricula: {},
    courseMeta: {},
    enrollments: [],
    reviews: [],
    certificates: [],
  };
}

const rid = (p: string) => p + Math.random().toString(36).slice(2, 8);
const totalLessons = (c: Curriculum) => c.modules.reduce((s, m) => s + m.lessons.length, 0);

const Ctx = createContext<Store | null>(null);

export function LmsStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initialState);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Partial<State>;
      setState((s) => ({
        ...s,
        enrollments: parsed.enrollments ?? [],
        reviews: parsed.reviews ?? [],
        certificates: parsed.certificates ?? [],
        curricula: parsed.curricula ?? {},
        courseMeta: parsed.courseMeta ?? {},
      }));
    } catch {
      /* ignore */
    }
  }, []);

  const persistLocal = useCallback((next: State) => {
    setState(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(
        KEY,
        JSON.stringify({
          enrollments: next.enrollments,
          reviews: next.reviews,
          certificates: next.certificates,
          curricula: next.curricula,
          courseMeta: next.courseMeta,
        }),
      );
    }
  }, []);

  const syncCurriculum = useCallback(async (courseId: string, modules: Module[]) => {
    try {
      await saveCourseCurriculum(courseId, modules);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save curriculum");
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const data = await api<{ items: ApiCategory[] }>("/categories?limit=50");
      const categories = (data.items ?? []).map(mapApiCategory);
      setState((s) => ({ ...s, categories, categoriesLoaded: true }));
    } catch {
      setState((s) => ({ ...s, categoriesLoaded: true }));
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const loadCurriculum = useCallback(async (courseId: string) => {
    const { course, curriculum } = await fetchCourseCurriculum(courseId);
    setState((s) => {
      const next = {
        ...s,
        curricula: { ...s.curricula, [courseId]: curriculum },
        courseMeta: {
          ...s.courseMeta,
          [courseId]: {
            title: course.title ?? "Course",
            instructor: course.instructorName ?? "Instructor",
          },
        },
      };
      if (typeof window !== "undefined") {
        localStorage.setItem(
          KEY,
          JSON.stringify({
            enrollments: next.enrollments,
            reviews: next.reviews,
            certificates: next.certificates,
            curricula: next.curricula,
            courseMeta: next.courseMeta,
          }),
        );
      }
      return next;
    });
    return curriculum;
  }, []);

  const value: Store = useMemo(() => {
    const getCurriculum = (courseId: string): Curriculum =>
      state.curricula[courseId] ?? emptyCurriculum(courseId);

    const updateCurriculum = (courseId: string, modules: Module[], sync = true) => {
      const cur = { courseId, modules };
      const next = { ...state, curricula: { ...state.curricula, [courseId]: cur } };
      persistLocal(next);
      if (sync) void syncCurriculum(courseId, modules);
    };

    return {
      ...state,
      loadCategories,
      loadCurriculum,
      addCategory: (name) =>
        toast.info("Categories are managed in Admin. Sign in as admin to add categories via the API."),
      deleteCategory: () => toast.info("Category delete requires admin API access."),
      addSubcategory: () => toast.info("Subcategories are seeded on the server — use admin to extend."),
      deleteSubcategory: () => toast.info("Subcategory delete requires admin API access."),
      getCurriculum,
      setCurriculum: (courseId, modules) => updateCurriculum(courseId, modules),
      addModule: (courseId, title) => {
        const cur = getCurriculum(courseId);
        updateCurriculum(courseId, [...cur.modules, { id: rid("m"), title, lessons: [] }]);
      },
      updateModule: (courseId, moduleId, title) => {
        const cur = getCurriculum(courseId);
        updateCurriculum(
          courseId,
          cur.modules.map((m) => (m.id === moduleId ? { ...m, title } : m)),
        );
      },
      deleteModule: (courseId, moduleId) => {
        const cur = getCurriculum(courseId);
        updateCurriculum(
          courseId,
          cur.modules.filter((m) => m.id !== moduleId),
        );
      },
      addLesson: (courseId, moduleId, lesson) => {
        const cur = getCurriculum(courseId);
        updateCurriculum(
          courseId,
          cur.modules.map((m) =>
            m.id === moduleId
              ? {
                  ...m,
                  lessons: [
                    ...m.lessons,
                    {
                      id: rid("l"),
                      title: lesson.title ?? "New lesson",
                      type: lesson.type ?? "video",
                      duration: lesson.duration ?? "10m",
                    },
                  ],
                }
              : m,
          ),
        );
      },
      updateLesson: (courseId, moduleId, lessonId, patch) => {
        const cur = getCurriculum(courseId);
        updateCurriculum(
          courseId,
          cur.modules.map((m) =>
            m.id === moduleId
              ? { ...m, lessons: m.lessons.map((l) => (l.id === lessonId ? { ...l, ...patch } : l)) }
              : m,
          ),
        );
      },
      deleteLesson: (courseId, moduleId, lessonId) => {
        const cur = getCurriculum(courseId);
        updateCurriculum(
          courseId,
          cur.modules.map((m) =>
            m.id === moduleId ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) } : m,
          ),
        );
      },
      enroll: (courseId, student) => {
        const existing = state.enrollments.find(
          (e) => e.courseId === courseId && e.studentName === student.name,
        );
        if (existing) return existing;
        const enrollment: Enrollment = {
          id: rid("en"),
          courseId,
          studentName: student.name,
          studentEmail: student.email,
          enrolledAt: new Date().toISOString(),
          completed: [],
        };
        persistLocal({ ...state, enrollments: [enrollment, ...state.enrollments] });
        return enrollment;
      },
      isEnrolled: (courseId, studentName) => {
        if (!studentName) return undefined;
        return state.enrollments.find((e) => e.courseId === courseId && e.studentName === studentName);
      },
      toggleLesson: (enrollmentId, lessonId) => {
        const next = state.enrollments.map((e) => {
          if (e.id !== enrollmentId) return e;
          const has = e.completed.includes(lessonId);
          return {
            ...e,
            completed: has ? e.completed.filter((l) => l !== lessonId) : [...e.completed, lessonId],
          };
        });
        persistLocal({ ...state, enrollments: next });
      },
      addReview: (r) =>
        persistLocal({
          ...state,
          reviews: [{ ...r, id: rid("rv"), createdAt: new Date().toISOString() }, ...state.reviews],
        }),
      reviewsForCourse: (courseId) => state.reviews.filter((r) => r.courseId === courseId),
      averageRating: (courseId) => {
        const list = state.reviews.filter((r) => r.courseId === courseId);
        if (!list.length) return { rating: 0, count: 0 };
        const sum = list.reduce((s, r) => s + r.rating, 0);
        return { rating: sum / list.length, count: list.length };
      },
      issueCertificate: (enrollmentId) => {
        const en = state.enrollments.find((e) => e.id === enrollmentId);
        if (!en) return null;
        const meta = state.courseMeta[en.courseId];
        if (!meta) return null;
        const cur = getCurriculum(en.courseId);
        if (en.completed.length < totalLessons(cur)) return null;
        const existing = state.certificates.find((c) => c.enrollmentId === enrollmentId);
        if (existing) return existing;
        const cert: Certificate = {
          id: rid("ct"),
          enrollmentId,
          courseId: en.courseId,
          courseTitle: meta.title,
          studentName: en.studentName,
          instructor: meta.instructor,
          issuedAt: new Date().toISOString(),
          serial: `TP-${Math.floor(10000 + Math.random() * 89999)}`,
        };
        persistLocal({ ...state, certificates: [cert, ...state.certificates] });
        return cert;
      },
      certificatesForStudent: (studentName) =>
        state.certificates.filter((c) => c.studentName === studentName),
      reset: () => persistLocal(initialState()),
    };
  }, [state, persistLocal, syncCurriculum, loadCategories, loadCurriculum]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLmsStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useLmsStore must be used inside LmsStoreProvider");
  return v;
}

export function lessonProgressPct(enrollment: Enrollment | undefined, curriculum: Curriculum): number {
  if (!enrollment) return 0;
  const total = totalLessons(curriculum);
  if (!total) return 0;
  return Math.round((enrollment.completed.length / total) * 100);
}

export function totalLessonCount(curriculum: Curriculum): number {
  return totalLessons(curriculum);
}
