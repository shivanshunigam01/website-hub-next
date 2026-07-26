"use client";

import heroPoster from "@/assets/hero-illustration.jpg";
import { DeferredBackgroundVideo } from "@/components/DeferredBackgroundVideo";

/**
 * LCP-friendly hero: poster image loads first (priority), video deferred.
 */
export function HeroBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 [&_*]:pointer-events-none">
      <DeferredBackgroundVideo
        src="/hero-video.mp4?v=2"
        poster={heroPoster}
        posterClassName="opacity-90 dark:opacity-75"
        className="opacity-85 dark:opacity-70"
        desktopDelayMs={2000}
        mobileDelayMs={5000}
      />
      <div className="pointer-events-none absolute inset-0 bg-background/30 dark:bg-background/50" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/25 via-background/15 to-background/60" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-160px] right-[-120px] h-[420px] w-[420px] rounded-full bg-fuchsia-500/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 left-[-120px] h-[360px] w-[360px] rounded-full bg-sky-400/10 blur-3xl" />
    </div>
  );
}
