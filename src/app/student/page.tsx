import { Suspense } from "react";
import StudentPage from "@/views/student";
import { createStaticPageMetadata } from "@/lib/page-metadata";

export const generateMetadata = createStaticPageMetadata("/student");


export default function Page() {
  return (
    <Suspense fallback={null}>
      <StudentPage />
    </Suspense>
  );
}
