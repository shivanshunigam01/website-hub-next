"use client";

import dynamic from "next/dynamic";
import { HomeHeroServer } from "@/components/home/HomeHeroServer";

const HeroSearchLazy = dynamic(
  () => import("@/components/home/HeroSearchLazy").then((m) => m.HeroSearchLazy),
  {
    loading: () => (
      <div className="min-h-[168px] max-w-3xl md:min-h-[200px]" aria-hidden />
    ),
  },
);

/** Homepage hero — poster + SSR copy only (no background MP4). */
export function HomeHeroClient() {
  return (
    <HomeHeroServer>
      <HeroSearchLazy />
    </HomeHeroServer>
  );
}
