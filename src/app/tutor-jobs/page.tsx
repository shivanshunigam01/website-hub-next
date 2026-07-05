import { Suspense } from "react";
import TutorJobsPagePage from "@/views/tutor-jobs";
import { createStaticPageMetadata } from "@/lib/page-metadata";

export const generateMetadata = createStaticPageMetadata("/tutor-jobs");


export default function Page() {
  return (
    <Suspense fallback={null}>
      <TutorJobsPagePage />
    </Suspense>
  );
}
