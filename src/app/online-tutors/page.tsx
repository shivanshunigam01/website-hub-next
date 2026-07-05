import { Suspense } from "react";
import PagePage from "@/views/online-tutors";
import { createStaticPageMetadata } from "@/lib/page-metadata";

export const generateMetadata = createStaticPageMetadata("/online-tutors");


export default function Page() {
  return (
    <Suspense fallback={null}>
      <PagePage />
    </Suspense>
  );
}
