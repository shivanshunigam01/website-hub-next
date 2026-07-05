import { Suspense } from "react";
import MarketingPagePage from "@/views/marketing";
import { createStaticPageMetadata } from "@/lib/page-metadata";

export const generateMetadata = createStaticPageMetadata("/marketing");


export default function Page() {
  return (
    <Suspense fallback={null}>
      <MarketingPagePage />
    </Suspense>
  );
}
