import { Suspense } from "react";
import PagePage from "@/views/assignment-jobs";
import { createStaticPageMetadata } from "@/lib/page-metadata";

export const generateMetadata = createStaticPageMetadata("/assignment-jobs");


export default function Page() {
  return (
    <Suspense fallback={null}>
      <PagePage />
    </Suspense>
  );
}
