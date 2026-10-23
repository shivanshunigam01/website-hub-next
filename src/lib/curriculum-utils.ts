import type { Curriculum, LessonType } from "@/hooks/use-lms-store";

export type { LessonType };

export function totalLessonCount(curriculum: Curriculum): number {
  return curriculum.modules.reduce((sum, m) => sum + m.lessons.length, 0);
}
