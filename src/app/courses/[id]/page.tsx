import { Suspense } from "react";
import CourseDetailPage from "@/views/courses.$id";
import { CourseJsonLd } from "@/components/seo/CourseJsonLd";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { metadataForCourseId } from "@/lib/seo-metadata-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return metadataForCourseId(id);
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Courses", path: "/courses" },
          { name: "Course", path: `/courses/${id}` },
        ]}
      />
      <CourseJsonLd id={id} />
      <Suspense fallback={null}>
        <CourseDetailPage />
      </Suspense>
    </>
  );
}
