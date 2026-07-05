import { Suspense } from "react";
import PagePage from "@/views/teaching-jobs";
import { createStaticPageMetadata } from "@/lib/page-metadata";

export const generateMetadata = createStaticPageMetadata("/teaching-jobs");


export default function Page() {
  return (
    <Suspense fallback={null}>
      <PagePage />
    </Suspense>
  );
}
