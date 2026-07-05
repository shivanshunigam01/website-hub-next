import { Suspense } from "react";
import FAQPage from "@/views/faq";
import { createStaticPageMetadata } from "@/lib/page-metadata";

export const generateMetadata = createStaticPageMetadata("/faq");


export default function Page() {
  return (
    <Suspense fallback={null}>
      <FAQPage />
    </Suspense>
  );
}
