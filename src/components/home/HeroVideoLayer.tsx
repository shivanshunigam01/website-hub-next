"use client";

import { DeferredBackgroundVideo } from "@/components/DeferredBackgroundVideo";

/** Desktop-only deferred video over the SSR poster (poster stays mounted in HomeHeroServer). */
export function HeroVideoLayer() {
  return (
    <DeferredBackgroundVideo
      src="/hero-video.mp4?v=2"
      className="opacity-85 dark:opacity-70"
      requireMediaQuery="(min-width: 769px)"
      desktopDelayMs={6000}
      mobileDelayMs={8000}
    />
  );
}
