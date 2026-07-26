"use client";

import Image, { type StaticImageData } from "next/image";
import { cn } from "@/lib/utils";
import { useDeferredBackgroundVideo } from "@/hooks/use-deferred-background-video";

type Props = {
  src: string;
  className?: string;
  /** Optional static poster shown immediately (preferred for LCP). */
  poster?: StaticImageData | string;
  posterClassName?: string;
  desktopDelayMs?: number;
  mobileDelayMs?: number;
  requireMediaQuery?: string;
  /** When true, wrap in absolute inset-0 container (default). */
  fill?: boolean;
};

/**
 * Poster-first background video. Defers the MP4 until after paint / when near viewport,
 * and skips on reduced-motion / save-data / slow connections.
 */
export function DeferredBackgroundVideo({
  src,
  className,
  poster,
  posterClassName,
  desktopDelayMs,
  mobileDelayMs,
  requireMediaQuery,
  fill = true,
}: Props) {
  const { containerRef, videoReady } = useDeferredBackgroundVideo({
    desktopDelayMs,
    mobileDelayMs,
    requireMediaQuery,
  });

  const shellClass = fill ? "pointer-events-none absolute inset-0" : "pointer-events-none relative";

  return (
    <div ref={containerRef} aria-hidden className={cn(shellClass, "[&_*]:pointer-events-none")}>
      {poster ? (
        typeof poster === "string" ? (
          // Remote / public path posters — avoid next/image host restrictions for local public files
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={poster}
            alt=""
            className={cn("absolute inset-0 h-full w-full object-cover", posterClassName)}
            decoding="async"
            fetchPriority="high"
          />
        ) : (
          <Image
            src={poster}
            alt=""
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            placeholder="blur"
            className={cn("object-cover", posterClassName)}
          />
        )
      ) : null}

      {videoReady ? (
        <video
          src={src}
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          className={cn("absolute inset-0 h-full w-full object-cover", className)}
        />
      ) : null}
    </div>
  );
}
