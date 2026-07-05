import { Suspense } from "react";
import WorkshopDetailPagePage from "@/views/workshops.$id";
import { createDynamicPageMetadata } from "@/lib/page-metadata";

export const generateMetadata = createDynamicPageMetadata("/workshops");


export default function Page() {
  return (
    <Suspense fallback={null}>
      <WorkshopDetailPagePage />
    </Suspense>
  );
}
