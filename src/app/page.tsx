import { Suspense } from "react";
import HomePagePage from "@/views/index";
import { createStaticPageMetadata } from "@/lib/page-metadata";
import heroPoster from "@/assets/hero-illustration.jpg";

export const generateMetadata = createStaticPageMetadata("/");

export default function Page() {
  return (
    <>
      <link rel="preload" as="image" href={heroPoster.src} fetchPriority="high" />
      <Suspense fallback={null}>
        <HomePagePage />
      </Suspense>
    </>
  );
}
