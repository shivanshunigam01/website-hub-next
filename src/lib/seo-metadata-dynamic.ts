import type { Metadata } from "next";
import { buildMetadata } from "@/lib/page-metadata";
import { fetchCourseForSeo, fetchTutorForSeo } from "@/lib/seo-server";

function clip(text: string, max = 155) {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

export async function metadataForTutorId(id: string): Promise<Metadata> {
  const tutor = await fetchTutorForSeo(id);
  const path = `/tutors/${id}`;
  if (!tutor?.name) {
    return buildMetadata({
      title: "Tutor profile · TeacherPoint",
      description: "View tutor profile, subjects, and reviews on TeacherPoint.",
      path,
    });
  }
  const subjects = tutor.teacherProfile?.subjects?.slice(0, 3).join(", ");
  const location =
    tutor.teacherProfile?.publicLocation ||
    [tutor.teacherProfile?.city, tutor.teacherProfile?.country].filter(Boolean).join(", ");
  const desc = clip(
    [tutor.teacherProfile?.bio, subjects && `Subjects: ${subjects}`, location && `Location: ${location}`]
      .filter(Boolean)
      .join(" · ") || `${tutor.name} — tutor on TeacherPoint`,
  );
  return buildMetadata({
    title: `${tutor.name} — Tutor · TeacherPoint`,
    description: desc,
    path,
    openGraph: { title: `${tutor.name} on TeacherPoint`, description: desc },
  });
}

export async function metadataForCourseId(id: string): Promise<Metadata> {
  const course = await fetchCourseForSeo(id);
  const path = `/courses/${id}`;
  if (!course?.title) {
    return buildMetadata({
      title: "Course · TeacherPoint",
      description: "Course details and enrollment on TeacherPoint.",
      path,
    });
  }
  const desc = clip(course.description || `Learn ${course.title} with TeacherPoint.`);
  return buildMetadata({
    title: `${course.title} — Course · TeacherPoint`,
    description: desc,
    path,
    openGraph: { title: course.title, description: desc },
  });
}
