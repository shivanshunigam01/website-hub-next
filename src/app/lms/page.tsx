import { Suspense } from "react";
import LMSPage from "@/views/lms";
import { createStaticPageMetadata } from "@/lib/page-metadata";

export const generateMetadata = createStaticPageMetadata("/lms");


export default function Page() {
  return (
    <Suspense fallback={null}>
      <LMSPage />
    </Suspense>
  );
}
