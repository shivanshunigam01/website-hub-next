import { Suspense } from "react";
import PrivacyPagePage from "@/views/privacy";
import { createStaticPageMetadata } from "@/lib/page-metadata";

export const generateMetadata = createStaticPageMetadata("/privacy");


export default function Page() {
  return (
    <Suspense fallback={null}>
      <PrivacyPagePage />
    </Suspense>
  );
}
