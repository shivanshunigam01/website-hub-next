import { Suspense } from "react";
import ReviewsPage from "@/views/reviews";
import { createStaticPageMetadata } from "@/lib/page-metadata";

export const generateMetadata = createStaticPageMetadata("/reviews");


export default function Page() {
  return (
    <Suspense fallback={null}>
      <ReviewsPage />
    </Suspense>
  );
}
