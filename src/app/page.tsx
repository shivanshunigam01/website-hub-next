import { Suspense } from "react";
import HomePagePage from "@/views/index";
import { createStaticPageMetadata } from "@/lib/page-metadata";
import { HomeHeroServer } from "@/components/home/HomeHeroServer";
import { HeroVideoLayer } from "@/components/home/HeroVideoLayer";
import { HeroInteractive } from "@/components/home/HeroInteractive";

export const generateMetadata = createStaticPageMetadata("/");

export default function Page() {
  return (
    <>
      <HomeHeroServer videoSlot={<HeroVideoLayer />}>
        <HeroInteractive />
      </HomeHeroServer>
      <Suspense fallback={null}>
        <HomePagePage />
      </Suspense>
    </>
  );
}
