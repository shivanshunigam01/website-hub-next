import HomePagePage from "@/views/index";
import { createStaticPageMetadata } from "@/lib/page-metadata";
import { HomeHeroServer } from "@/components/home/HomeHeroServer";
import { HeroVideoLayer } from "@/components/home/HeroVideoLayer";
import { HeroInteractive } from "@/components/home/HeroInteractive";
import { HomeBelowFoldShell } from "@/components/home/HomeBelowFoldShell";

export const generateMetadata = createStaticPageMetadata("/");

export default function Page() {
  return (
    <>
      <HomeHeroServer videoSlot={<HeroVideoLayer />}>
        <HeroInteractive />
      </HomeHeroServer>
      <HomeBelowFoldShell>
        <HomePagePage />
      </HomeBelowFoldShell>
    </>
  );
}
