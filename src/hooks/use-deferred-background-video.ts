"use client";

import { useEffect, useRef, useState } from "react";

type Options = {
  /** Delay before mounting video on desktop (ms). */
  desktopDelayMs?: number;
  /** Delay before mounting video on mobile (ms). */
  mobileDelayMs?: number;
  /** Only load when this element is near the viewport. */
  rootMargin?: string;
  /** Skip video entirely below this media query (e.g. "(min-width: 1024px)"). */
  requireMediaQuery?: string;
};

/**
 * Defers mounting heavy background videos so posters/images win LCP and
 * bandwidth isn't stolen by multi‑MB autoplay files on first paint.
 */
export function useDeferredBackgroundVideo(options: Options = {}) {
  const {
    desktopDelayMs = 2000,
    mobileDelayMs = 5000,
    rootMargin = "200px",
    requireMediaQuery,
  } = options;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } })
      .connection;
    if (conn?.saveData) return;
    if (conn?.effectiveType === "slow-2g" || conn?.effectiveType === "2g") return;

    if (requireMediaQuery && !window.matchMedia(requireMediaQuery).matches) return;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const delay = isMobile ? mobileDelayMs : desktopDelayMs;

    let timer: number | undefined;
    let cancelled = false;

    const arm = () => {
      if (cancelled || timer != null) return;
      timer = window.setTimeout(() => {
        if (!cancelled) setVideoReady(true);
      }, delay);
    };

    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      arm();
      return () => {
        cancelled = true;
        if (timer != null) window.clearTimeout(timer);
      };
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          arm();
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);

    return () => {
      cancelled = true;
      io.disconnect();
      if (timer != null) window.clearTimeout(timer);
    };
  }, [desktopDelayMs, mobileDelayMs, rootMargin, requireMediaQuery]);

  return { containerRef, videoReady };
}
