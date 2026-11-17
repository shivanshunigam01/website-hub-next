"use client";

import dynamic from "next/dynamic";
import { HomeHeroServer } from "@/components/home/HomeHeroServer";
import { HeroVideoLayer } from "@/components/home/HeroVideoLayer";

const HeroSearchLazy = dynamic(
  () => import("@/components/home/HeroSearchLazy").then((m) => m.HeroSearchLazy),
  {
    loading: () => (
      <div className="min-h-[168px] max-w-3xl md:min-h-[200px]" aria-hidden />
    ),
  },
);

/** Homepage hero — Unsplash HD poster + deferred desktop background video. */
export function HomeHeroClient() {
  return (
    <HomeHeroServer videoSlot={<HeroVideoLayer />}>
      <HeroSearchLazy />
    </HomeHeroServer>
  );
}
