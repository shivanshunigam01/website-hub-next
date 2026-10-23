import dynamic from "next/dynamic";
import { createStaticPageMetadata } from "@/lib/page-metadata";
import { HomeHeroClient } from "@/components/home/HomeHeroClient";
import { HomeBelowFoldPlaceholders } from "@/components/home/HomeBelowFoldPlaceholders";
import { HomeBelowFoldShell } from "@/components/home/HomeBelowFoldShell";

const HomePagePage = dynamic(() => import("@/views/index"), {
  loading: () => <HomeBelowFoldPlaceholders />,
});

export const generateMetadata = createStaticPageMetadata("/");

export default function Page() {
  return (
    <>
      <HomeHeroClient />
      <HomeBelowFoldShell>
        <HomePagePage />
      </HomeBelowFoldShell>
    </>
  );
}
