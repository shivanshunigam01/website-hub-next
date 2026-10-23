import { Suspense } from "react";
import FAQPage from "@/views/faq";
import { FaqJsonLd } from "@/components/seo/FaqJsonLd";
import { createStaticPageMetadata } from "@/lib/page-metadata";

export const generateMetadata = createStaticPageMetadata("/faq");

export default function Page() {
  return (
    <>
      <FaqJsonLd />
      <Suspense fallback={null}>
        <FAQPage />
      </Suspense>
    </>
  );
}
