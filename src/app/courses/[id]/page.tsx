import { Suspense } from "react";
import CourseDetailPage from "@/views/courses.$id";
import { createDynamicPageMetadata } from "@/lib/page-metadata";

export const generateMetadata = createDynamicPageMetadata("/courses");


export default function Page() {
  return (
    <Suspense fallback={null}>
      <CourseDetailPage />
    </Suspense>
  );
}
