import { Suspense } from "react";
import TermsPagePage from "@/views/terms";
import { createStaticPageMetadata } from "@/lib/page-metadata";

export const generateMetadata = createStaticPageMetadata("/terms");


export default function Page() {
  return (
    <Suspense fallback={null}>
      <TermsPagePage />
    </Suspense>
  );
}
