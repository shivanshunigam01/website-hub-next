"use client";

import { DeferredBackgroundVideo } from "@/components/DeferredBackgroundVideo";
import { HOME_HERO_POSTER_URL, HOME_HERO_VIDEO_URL } from "@/data/hero-media";

/**
 * LCP-friendly hero: poster image loads first (priority), video deferred.
 */
export function HeroBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden [contain:paint] [&_*]:pointer-events-none"
    >
      <DeferredBackgroundVideo
        src={HOME_HERO_VIDEO_URL}
        poster={HOME_HERO_POSTER_URL}
        posterClassName="opacity-95 dark:opacity-90"
        className="opacity-95 dark:opacity-90"
        requireMediaQuery="(min-width: 769px)"
        desktopDelayMs={3500}
        mobileDelayMs={8000}
      />
      <div className="pointer-events-none absolute inset-0 bg-background/30 dark:bg-background/50" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/25 via-background/15 to-background/60" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-160px] right-[-120px] h-[420px] w-[420px] rounded-full bg-fuchsia-500/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 left-[-120px] h-[360px] w-[360px] rounded-full bg-sky-400/10 blur-3xl" />
    </div>
  );
}
