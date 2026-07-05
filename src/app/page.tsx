import { Suspense } from "react";
import HomePagePage from "@/views/index";
import { createStaticPageMetadata } from "@/lib/page-metadata";

export const generateMetadata = createStaticPageMetadata("/");


export default function Page() {
  return (
    <Suspense fallback={null}>
      <HomePagePage />
    </Suspense>
  );
}
