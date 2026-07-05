import { Suspense } from "react";
import AccommodationPagePage from "@/views/accommodation";
import { createStaticPageMetadata } from "@/lib/page-metadata";

export const generateMetadata = createStaticPageMetadata("/accommodation");


export default function Page() {
  return (
    <Suspense fallback={null}>
      <AccommodationPagePage />
    </Suspense>
  );
}
