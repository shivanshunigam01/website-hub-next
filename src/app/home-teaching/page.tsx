import { Suspense } from "react";
import PagePage from "@/views/home-teaching";
import { createStaticPageMetadata } from "@/lib/page-metadata";

export const generateMetadata = createStaticPageMetadata("/home-teaching");


export default function Page() {
  return (
    <Suspense fallback={null}>
      <PagePage />
    </Suspense>
  );
}
