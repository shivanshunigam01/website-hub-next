import type { TeachingSubject } from "@/lib/auth-types";

/** @deprecated Use GET /subjects API — kept as offline fallback only */
export const COMMON_TEACHING_SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English Literature",
  "Computer Science",
  "Spoken English",
  "Spanish",
  "Economics",
  "History",
  "Mandarin",
  "Hindi",
  "French",
  "Accounting",
  "Statistics",
  "Psychology",
  "Geography",
  "Business Studies",
  "Test Automation",
  "Python",
  "NEET",
  "IELTS",
  "JEE Main",
] as const;

export const TEACHING_LEVELS = [
  "Nursery",
  "Kindergarten",
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "IGCSE",
  "GCSE",
  "O level",
  "Grade 11",
  "AS level",
  "A2 level",
  "A level",
  "Grade 12",
  "Diploma",
  "Bachelors/Undergraduate",
  "Masters/Postgraduate",
  "MPhil",
  "Doctorate/PhD",
] as const;

export type TeachingLevel = (typeof TEACHING_LEVELS)[number];

// Backward-compatibility for legacy stored values (e.g. "Class 10").
const LEVEL_ALIASES: Record<string, string> = {
  "Class 8": "Grade 8",
  "Class 9": "Grade 9",
  "Class 10": "Grade 10",
  "Class 11": "Grade 11",
  "Class 12": "Grade 12",
  "Undergraduate": "Bachelors/Undergraduate",
  "Graduate": "Masters/Postgraduate",
  "Professional / Adult": "Diploma",
};

export function levelIndex(level: string) {
  const normalized = LEVEL_ALIASES[level] ?? level;
  return TEACHING_LEVELS.indexOf(normalized as TeachingLevel);
}

export function isValidLevelRange(fromLevel: string, toLevel: string) {
  const from = levelIndex(fromLevel);
  const to = levelIndex(toLevel);
  if (from < 0 || to < 0) {
    return Boolean(fromLevel.trim() && toLevel.trim());
  }
  return from <= to;
}

export function normalizeTeachingSubjects(
  teachingSubjects?: TeachingSubject[],
  legacySubjects?: string[],
): TeachingSubject[] {
  if (teachingSubjects?.length) return teachingSubjects;
  return (legacySubjects ?? []).map((name) => ({ name, fromLevel: "", toLevel: "" }));
}

export function formatTeachingSubjectLabel(entry: TeachingSubject) {
  if (entry.fromLevel && entry.toLevel) {
    return `${entry.name} (${entry.fromLevel} – ${entry.toLevel})`;
  }
  return entry.name;
}
