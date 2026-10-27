"use client";

import { DeferredBackgroundVideo } from "@/components/DeferredBackgroundVideo";
import { HOME_HERO_VIDEO_URL } from "@/data/hero-media";

/** Desktop-only deferred video over the SSR poster (poster stays mounted in HomeHeroServer). */
export function HeroVideoLayer() {
  return (
    <DeferredBackgroundVideo
      src={HOME_HERO_VIDEO_URL}
      className="opacity-95 dark:opacity-90"
      requireMediaQuery="(min-width: 769px)"
      desktopDelayMs={3500}
      mobileDelayMs={8000}
    />
  );
}
