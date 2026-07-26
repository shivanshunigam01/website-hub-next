"use client";

import { DeferredBackgroundVideo } from "@/components/DeferredBackgroundVideo";

const TUTOR_BANNER_VIDEO = "/tutor-hero-video.mp4?v=2";
const TUTOR_BANNER_POSTER = "/tutor-hero-video-poster.jpg?v=2";

export function TutorPageBannerBackground() {
  return (
    <>
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden bg-primary">
        <DeferredBackgroundVideo
          src={TUTOR_BANNER_VIDEO}
          poster={TUTOR_BANNER_POSTER}
          desktopDelayMs={1500}
          mobileDelayMs={4000}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/70 via-primary/55 to-indigo-950/65" />
        <div className="absolute inset-0 bg-black/15" />
      </div>
      <div className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 left-1/4 h-56 w-56 rounded-full bg-fuchsia-400/20 blur-3xl" />
    </>
  );
}
