import { Suspense } from "react";
import PagePage from "@/views/home-tutors";
import { createStaticPageMetadata } from "@/lib/page-metadata";

export const generateMetadata = createStaticPageMetadata("/home-tutors");


export default function Page() {
  return (
    <Suspense fallback={null}>
      <PagePage />
    </Suspense>
  );
}
