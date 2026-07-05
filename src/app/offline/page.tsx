import { Suspense } from "react";
import OfflinePagePage from "@/views/offline";
import { createStaticPageMetadata } from "@/lib/page-metadata";

export const generateMetadata = createStaticPageMetadata("/offline");


export default function Page() {
  return (
    <Suspense fallback={null}>
      <OfflinePagePage />
    </Suspense>
  );
}
