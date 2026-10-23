import { createStaticPageMetadata } from "@/lib/page-metadata";
import { HomeCatalogPrefetch } from "@/components/home/HomeCatalogPrefetch";
import { HomeHeroClient } from "@/components/home/HomeHeroClient";
import { HomeBelowFoldMount } from "@/components/home/HomeBelowFoldMount";
import { HomeBelowFoldShell } from "@/components/home/HomeBelowFoldShell";

export const generateMetadata = createStaticPageMetadata("/");

export default function Page() {
  return (
    <>
      <HomeCatalogPrefetch />
      <HomeHeroClient />
      <HomeBelowFoldShell>
        <HomeBelowFoldMount />
      </HomeBelowFoldShell>
    </>
  );
}
