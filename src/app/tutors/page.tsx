import { Suspense } from "react";
import TutorsPagePage from "@/views/tutors.index";
import { createStaticPageMetadata } from "@/lib/page-metadata";

export const generateMetadata = createStaticPageMetadata("/tutors");


export default function Page() {
  return (
    <Suspense fallback={null}>
      <TutorsPagePage />
    </Suspense>
  );
}
