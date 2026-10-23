import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { createStaticPageMetadata } from "@/lib/page-metadata";
import { HOME_CATALOG_REVALIDATE } from "@/lib/catalog-server";
import { getQueryClient } from "@/lib/get-query-client";
import { prefetchHomeCatalogOnServer } from "@/lib/prefetch-home-catalog-server";
import { HomeHeroClient } from "@/components/home/HomeHeroClient";
import { HomeBelowFoldMount } from "@/components/home/HomeBelowFoldMount";
import { HomeBelowFoldShell } from "@/components/home/HomeBelowFoldShell";

export const generateMetadata = createStaticPageMetadata("/");

/** ISR: regenerate cached home catalog from the API on this interval (seconds). */
export const revalidate = HOME_CATALOG_REVALIDATE;

export default async function Page() {
  const queryClient = getQueryClient();
  await prefetchHomeCatalogOnServer(queryClient);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomeHeroClient />
      <HomeBelowFoldShell>
        <HomeBelowFoldMount />
      </HomeBelowFoldShell>
    </HydrationBoundary>
  );
}
