import type { Course, CategoryItem, Tutor, CourseLevel } from "@/types/catalog";
import type { Curriculum, Lesson, LessonType, Module } from "@/hooks/use-lms-store";

export type ApiCourse = {
  id: string;
  title?: string;
  slug?: string;
  instructorId?: string;
  instructorName?: string;
  category?: string;
  categoryId?: string;
  level?: string;
  rating?: number;
  reviewCount?: number;
  price?: number;
  oldPrice?: number;
  currency?: string;
  duration?: string;
  lessons?: number;
  students?: number;
  bestseller?: boolean;
  certificate?: boolean;
  language?: string;
  gradient?: string;
  imageUrl?: string;
  description?: string;
  status?: string;
  curriculum?: ApiCurriculumModule[];
};

export type ApiCurriculumModule = {
  moduleId?: string;
  title?: string;
  order?: number;
  lessons?: {
    lessonId?: string;
    title?: string;
    type?: string;
    durationMinutes?: number;
    order?: number;
  }[];
};

export type ApiCategory = {
  id: string;
  name?: string;
  icon?: string;
  slug?: string;
  subcategories?: { subId?: string; name?: string; slug?: string }[];
};

export type ApiTutor = {
  id: string;
  name?: string;
  avatarUrl?: string;
  profilePhoto?: string;
  image?: string;
  subject?: string;
  subjects?: string[];
  teachingSubjects?: { name: string; fromLevel?: string; toLevel?: string }[];
  speciality?: string;
  teacherType?: "individual" | "company" | "coaching_institute" | "school" | "college" | "freelancer";
  location?: string;
  country?: string;
  state?: string;
  city?: string;
  locality?: string;
  publicLocation?: string;
  rating?: number;
  reviews?: number;
  reviewCount?: number;
  experience?: number;
  yearsOfExperience?: number;
  price?: number;
  hourlyRate?: number;
  currency?: string;
  verified?: boolean;
  topTen?: boolean;
  online?: boolean;
  onlineTeaching?: boolean;
  homeTuition?: boolean;
  groupClasses?: boolean;
  assignmentHelp?: boolean;
  language?: string | string[];
  languages?: string[];
  gender?: string;
  bio?: string;
  teachingStyle?: string;
  initials?: string;
  gradient?: string;
  availability?: string;
  lastLoginAt?: string | null;
  education?: TutorEducationEntry[];
  experiences?: TutorExperienceEntry[];
  experienceEntries?: TutorExperienceEntry[];
  profileCompleted?: boolean;
};

type TutorEducationEntry = {
  id?: string;
  degree?: string;
  institute?: string;
  startDate?: string | null;
  endDate?: string | null;
  description?: string;
};

type TutorExperienceEntry = {
  id?: string;
  title?: string;
  organization?: string;
  startDate?: string | null;
  endDate?: string | null;
  description?: string;
};

const GRADIENTS = [
  "linear-gradient(135deg,#38bdf8,#6366f1)",
  "linear-gradient(135deg,#a78bfa,#ec4899)",
  "linear-gradient(135deg,#f59e0b,#ef4444)",
  "linear-gradient(135deg,#10b981,#06b6d4)",
];

function levelOf(v?: string): CourseLevel {
  if (v === "Intermediate" || v === "Advanced") return v;
  return "Beginner";
}

function mapLessonType(t?: string): LessonType {
  if (t === "article" || t === "reading") return "reading";
  if (t === "quiz") return "quiz";
  if (t === "assignment") return "assignment";
  return "video";
}

function toLessonTypeForApi(t: LessonType): string {
  if (t === "reading") return "article";
  if (t === "assignment") return "article";
  return t;
}

export function mapApiCourse(c: ApiCourse, index = 0): Course {
  const price = Number(c.price ?? 0);
  return {
    id: c.id,
    title: c.title ?? "Untitled course",
    instructor: c.instructorName ?? "Instructor",
    instructorId: c.instructorId,
    category: c.category ?? "General",
    categoryId: c.categoryId,
    level: levelOf(c.level),
    rating: Number(c.rating ?? 0),
    reviews: Number(c.reviewCount ?? 0),
    price,
    oldPrice: Number(c.oldPrice ?? (Math.round(price * 4.5) || price)),
    currency: c.currency ?? "USD",
    duration: c.duration ?? "10h",
    lessons: Number(c.lessons ?? 0),
    students: Number(c.students ?? 0),
    bestseller: c.bestseller,
    certificate: c.certificate !== false,
    language: c.language ?? "English",
    gradient: c.gradient?.startsWith("from-")
      ? c.gradient
      : c.gradient || GRADIENTS[index % GRADIENTS.length],
    description: c.description ?? "",
    status: c.status,
    imageUrl: c.imageUrl,
  };
}

export function mapApiCategory(c: ApiCategory): CategoryItem {
  return {
    id: c.id,
    name: c.name ?? "",
    icon: c.icon,
    slug: c.slug,
    subcategories: (c.subcategories ?? []).map((s, i) => ({
      id: s.subId ?? `sub-${i}`,
      name: s.name ?? "",
    })),
  };
}

export function mapApiTutor(t: ApiTutor, index = 0): Tutor {
  const langs = Array.isArray(t.language)
    ? t.language
    : Array.isArray(t.languages)
      ? t.languages
      : t.language
        ? [t.language]
        : ["English"];
  const gender =
    t.gender === "female" || t.gender === "male" || t.gender === "other" ? t.gender : "male";
  const teachingSubjects = (t.teachingSubjects ?? []).map((entry) => ({
    name: entry.name,
    fromLevel: entry.fromLevel ?? "",
    toLevel: entry.toLevel ?? "",
  }));
  const yearsExp = Number(t.yearsOfExperience ?? t.experience ?? 0);
  const onlineTeaching = t.onlineTeaching === true || t.online !== false;
  return {
    id: String(t.id ?? (t as { _id?: string })._id ?? ""),
    name: t.name ?? "Tutor",
    avatarUrl: t.avatarUrl || t.profilePhoto || t.image,
    profilePhoto: t.profilePhoto || t.avatarUrl || t.image,
    image: t.image || t.avatarUrl || t.profilePhoto,
    subject: t.subject ?? t.subjects?.[0] ?? teachingSubjects[0]?.name ?? "General",
    subjects: t.subjects,
    teachingSubjects,
    speciality: t.speciality ?? "",
    teacherType: t.teacherType === "company" ? "company" : (t.teacherType ?? "individual"),
    location: t.location ?? t.publicLocation ?? "",
    country: t.country ?? "",
    state: t.state ?? "",
    city: t.city ?? "",
    locality: t.locality ?? "",
    publicLocation: t.publicLocation ?? t.location ?? "",
    rating: Number(t.rating ?? 0),
    reviews: Number(t.reviews ?? t.reviewCount ?? 0),
    experience: yearsExp,
    yearsOfExperience: yearsExp,
    price: Number(t.price ?? t.hourlyRate ?? 0),
    currency: t.currency ?? "USD",
    verified: !!t.verified,
    topTen: t.topTen,
    online: onlineTeaching,
    onlineTeaching,
    homeTuition: !!t.homeTuition,
    groupClasses: !!t.groupClasses,
    assignmentHelp: !!t.assignmentHelp,
    language: langs,
    gender,
    bio: t.bio ?? "",
    teachingStyle: t.teachingStyle ?? "",
    initials: t.initials ?? (t.name ?? "T").slice(0, 2).toUpperCase(),
    gradient: t.gradient || GRADIENTS[index % GRADIENTS.length],
    availability: t.availability ?? "Flexible",
    lastLoginAt: t.lastLoginAt ?? null,
    education: (t.education ?? []).map((e) => ({
      id: e.id,
      degree: e.degree ?? "",
      institute: e.institute ?? "",
      startDate: e.startDate,
      endDate: e.endDate,
      description: e.description ?? "",
    })),
    experienceEntries: (t.experiences ?? t.experienceEntries ?? []).map((e) => ({
      id: e.id,
      title: e.title ?? "",
      organization: e.organization ?? "",
      startDate: e.startDate,
      endDate: e.endDate,
      description: e.description ?? "",
    })),
    profileCompleted: !!t.profileCompleted,
  };
}

export function mapCurriculumFromApi(courseId: string, modules: ApiCurriculumModule[] = []): Curriculum {
  return {
    courseId,
    modules: modules.map((m, mi) => ({
      id: m.moduleId ?? `mod-${mi}`,
      title: m.title ?? `Module ${mi + 1}`,
      lessons: (m.lessons ?? []).map((l, li) => ({
        id: l.lessonId ?? `les-${mi}-${li}`,
        title: l.title ?? "Lesson",
        type: mapLessonType(l.type),
        duration: l.durationMinutes ? `${l.durationMinutes}m` : "10m",
      })),
    })),
  };
}

export function curriculumToApi(modules: Module[]) {
  return modules.map((m, mi) => ({
    moduleId: m.id,
    title: m.title,
    order: mi + 1,
    lessons: m.lessons.map((l, li) => ({
      lessonId: l.id,
      title: l.title,
      type: toLessonTypeForApi(l.type),
      durationMinutes: parseInt(l.duration, 10) || 10,
      order: li + 1,
    })),
  }));
}
