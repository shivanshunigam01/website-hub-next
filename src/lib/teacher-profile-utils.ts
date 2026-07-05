import type {
  AuthUser,
  EducationEntry,
  ExperienceEntry,
  ProfileCompletionProgress,
  TeacherProfile,
} from "@/lib/auth-types";
import { BIO_MIN_WORDS, BIO_MAX_CHARS, countBioWords, isBioValid } from "@/lib/bio-words";

export { BIO_MIN_WORDS, BIO_MAX_CHARS as BIO_MAX, countBioWords, isBioValid };

export function formatBirthDate(value?: string | Date | null) {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export function hasTeacherLocation(profile?: TeacherProfile) {
  if (!profile) return false;
  if (profile.country?.trim() && profile.city?.trim()) return true;
  if (profile.location?.trim()) return true;
  if (profile.publicLocation?.trim() && (profile.city?.trim() || profile.locality?.trim())) return true;
  return false;
}

export function hasProfilePhoto(user?: AuthUser | null) {
  return Boolean(user?.avatarUrl?.trim() || user?.teacherProfile?.profilePhoto?.trim());
}

export function computeTeacherProfileProgress(user?: AuthUser | null): ProfileCompletionProgress {
  const p = user?.teacherProfile;
  const bio = (p?.bio || "").trim();
  const checks = {
    profilePhoto: hasProfilePhoto(user),
    bio: isBioValid(bio),
    subjects: (p?.teachingSubjects?.length || p?.subjects?.length || 0) > 0,
    experience: (p?.experiences?.length || p?.experienceEntries?.length || 0) > 0,
    education: (p?.education?.length || 0) > 0,
    location: hasTeacherLocation(p),
    hourlyRate: p?.hourlyRate != null && p.hourlyRate > 0,
  };
  const total = Object.keys(checks).length;
  const completed = Object.values(checks).filter(Boolean).length;
  return { checks, completed, total, percent: Math.round((completed / total) * 100) };
}

export function buildPublicLocation(profile?: TeacherProfile) {
  if (!profile) return "";
  if (profile.publicLocation?.trim()) return profile.publicLocation.trim();
  const parts = [profile.locality, profile.city, profile.state, profile.country].filter((s) =>
    String(s || "").trim(),
  );
  if (parts.length) return parts.join(", ");
  return profile.location?.trim() || "";
}

export function emptyEducationEntry(): EducationEntry {
  return { degree: "", institute: "", startDate: "", endDate: "", description: "" };
}

export function emptyExperienceEntry(): ExperienceEntry {
  return { title: "", organization: "", startDate: "", endDate: "", description: "" };
}

export const TEACHER_TYPE_OPTIONS = [
  { value: "individual", label: "Individual Teacher" },
  { value: "coaching_institute", label: "Coaching Institute" },
  { value: "school", label: "School" },
  { value: "college", label: "College" },
  { value: "freelancer", label: "Freelancer" },
  { value: "company", label: "Tutoring Company" },
] as const;

export const PROFILE_CHECK_LABELS: Record<keyof ProfileCompletionProgress["checks"], string> = {
  profilePhoto: "Profile photo",
  bio: "Bio (150+ words)",
  subjects: "At least 1 subject",
  experience: "Work experience",
  education: "Education",
  location: "Location",
  hourlyRate: "Hourly rate",
};
