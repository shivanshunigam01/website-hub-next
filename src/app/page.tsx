import { createStaticPageMetadata } from "@/lib/page-metadata";
import { HomeHeroClient } from "@/components/home/HomeHeroClient";
import { HomeBelowFoldShell } from "@/components/home/HomeBelowFoldShell";
import HomePage from "@/views/index";

export const generateMetadata = createStaticPageMetadata("/");

export default function Page() {
  return (
    <>
      <HomeHeroClient />
      <HomeBelowFoldShell>
        <HomePage />
      </HomeBelowFoldShell>
    </>
  );
}
