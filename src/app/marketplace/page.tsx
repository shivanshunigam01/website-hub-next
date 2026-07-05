import { Suspense } from "react";
import MarketPage from "@/views/marketplace";
import { createStaticPageMetadata } from "@/lib/page-metadata";

export const generateMetadata = createStaticPageMetadata("/marketplace");


export default function Page() {
  return (
    <Suspense fallback={null}>
      <MarketPage />
    </Suspense>
  );
}
