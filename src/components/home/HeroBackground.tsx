"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import heroPoster from "@/assets/hero-illustration.jpg";

/**
 * LCP-friendly hero: poster image loads first (priority), video deferred.
 */
export function HeroBackground() {
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) return;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const delay = isMobile ? 5000 : 2000;

    const timer = window.setTimeout(() => setVideoReady(true), delay);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 [&_*]:pointer-events-none">
      <Image
        src={heroPoster}
        alt=""
        fill
        priority
        fetchPriority="high"
        sizes="100vw"
        className="pointer-events-none object-cover opacity-90 dark:opacity-75"
        placeholder="blur"
      />
      {videoReady ? (
        <video
          src="/hero-video.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-85 dark:opacity-70"
        />
      ) : null}
      <div className="pointer-events-none absolute inset-0 bg-background/30 dark:bg-background/50" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/25 via-background/15 to-background/60" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-160px] right-[-120px] h-[420px] w-[420px] rounded-full bg-fuchsia-500/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 left-[-120px] h-[360px] w-[360px] rounded-full bg-sky-400/10 blur-3xl" />
    </div>
  );
}
