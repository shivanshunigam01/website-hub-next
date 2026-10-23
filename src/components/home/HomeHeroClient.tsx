"use client";

import dynamic from "next/dynamic";
import { HomeHeroServer } from "@/components/home/HomeHeroServer";

const HeroVideoLayer = dynamic(
  () => import("@/components/home/HeroVideoLayer").then((m) => m.HeroVideoLayer),
  { ssr: false },
);

const HeroInteractive = dynamic(
  () => import("@/components/home/HeroInteractive").then((m) => m.HeroInteractive),
  {
    loading: () => <div className="mt-9 min-h-[200px] md:min-h-[220px]" aria-hidden />,
  },
);

export function HomeHeroClient() {
  return (
    <HomeHeroServer videoSlot={<HeroVideoLayer />}>
      <HeroInteractive />
    </HomeHeroServer>
  );
}
