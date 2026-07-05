import { Suspense } from "react";
import WorkshopsPagePage from "@/views/workshops";
import { createStaticPageMetadata } from "@/lib/page-metadata";

export const generateMetadata = createStaticPageMetadata("/workshops");


export default function Page() {
  return (
    <Suspense fallback={null}>
      <WorkshopsPagePage />
    </Suspense>
  );
}
