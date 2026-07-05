import { Suspense } from "react";
import FPPage from "@/views/courses";
import { createStaticPageMetadata } from "@/lib/page-metadata";

export const generateMetadata = createStaticPageMetadata("/courses");


export default function Page() {
  return (
    <Suspense fallback={null}>
      <FPPage />
    </Suspense>
  );
}
