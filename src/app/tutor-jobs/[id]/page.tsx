import { Suspense } from "react";
import TutorJobDetailPage from "@/views/tutor-jobs.$id";
import { createDynamicPageMetadata } from "@/lib/page-metadata";

export const generateMetadata = createDynamicPageMetadata("/tutor-jobs");


export default function Page() {
  return (
    <Suspense fallback={null}>
      <TutorJobDetailPage />
    </Suspense>
  );
}
