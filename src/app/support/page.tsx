import { Suspense } from "react";
import SupportPage from "@/views/support";
import { createStaticPageMetadata } from "@/lib/page-metadata";

export const generateMetadata = createStaticPageMetadata("/support");


export default function Page() {
  return (
    <Suspense fallback={null}>
      <SupportPage />
    </Suspense>
  );
}
