import { Suspense } from "react";
import TeacherPage from "@/views/teacher";
import { createStaticPageMetadata } from "@/lib/page-metadata";

export const generateMetadata = createStaticPageMetadata("/teacher");


export default function Page() {
  return (
    <Suspense fallback={null}>
      <TeacherPage />
    </Suspense>
  );
}
