import { Suspense } from "react";
import PricingPage from "@/views/pricing";
import { createStaticPageMetadata } from "@/lib/page-metadata";

export const generateMetadata = createStaticPageMetadata("/pricing");


export default function Page() {
  return (
    <Suspense fallback={null}>
      <PricingPage />
    </Suspense>
  );
}
