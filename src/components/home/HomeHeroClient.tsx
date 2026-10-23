"use client";

import dynamic from "next/dynamic";
import { HomeHeroServer } from "@/components/home/HomeHeroServer";

const HeroInteractive = dynamic(
  () => import("@/components/home/HeroInteractive").then((m) => m.HeroInteractive),
  {
    loading: () => (
      <div className="mt-9 min-h-[380px] md:min-h-[400px]" aria-hidden />
    ),
  },
);

/** Homepage hero — poster + SSR copy only (no background MP4; saves ~500KB and TBT on GTmetrix). */
export function HomeHeroClient() {
  return (
    <HomeHeroServer>
      <HeroInteractive />
    </HomeHeroServer>
  );
}
