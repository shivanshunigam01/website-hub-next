import { Suspense } from "react";
import RefundPagePage from "@/views/refund";
import { createStaticPageMetadata } from "@/lib/page-metadata";

export const generateMetadata = createStaticPageMetadata("/refund");


export default function Page() {
  return (
    <Suspense fallback={null}>
      <RefundPagePage />
    </Suspense>
  );
}
