import { Suspense } from "react";
import TutorDetailPage from "@/views/tutors.$id";
import { createDynamicPageMetadata } from "@/lib/page-metadata";

export const generateMetadata = createDynamicPageMetadata("/tutors");


export default function Page() {
  return (
    <Suspense fallback={null}>
      <TutorDetailPage />
    </Suspense>
  );
}
