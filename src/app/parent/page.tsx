import { Suspense } from "react";
import ParentPage from "@/views/parent";
import { createStaticPageMetadata } from "@/lib/page-metadata";

export const generateMetadata = createStaticPageMetadata("/parent");


export default function Page() {
  return (
    <Suspense fallback={null}>
      <ParentPage />
    </Suspense>
  );
}
