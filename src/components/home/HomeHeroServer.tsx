import Image from "next/image";
import type { ReactNode } from "react";
import { HOME_HERO_POSTER_URL } from "@/data/hero-media";

/**
 * SSR hero — mobile LCP is typically the priority poster `Image` or the static H1 below.
 * Copy avoids unverified numeric claims (country counts, review totals).
 */
export function HomeHeroServer({
  children,
  videoSlot,
}: {
  children: ReactNode;
  videoSlot?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b bg-gradient-hero">
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden [contain:paint]">
        <Image
          src={HOME_HERO_POSTER_URL}
          alt=""
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="object-cover opacity-95 dark:opacity-90"
        />
        {videoSlot ? (
          <div className="absolute inset-0 z-[1] [&_video]:saturate-[1.05]">{videoSlot}</div>
        ) : null}
        <div className="absolute inset-0 z-[2] bg-background/20 dark:bg-background/35" />
        <div className="absolute inset-0 z-[2] bg-gradient-to-b from-background/20 via-background/10 to-background/55" />
      </div>

      <div className="container relative z-[1] mx-auto px-4 py-16 sm:px-6 md:py-24 lg:py-28">
        <p
          className="text-center text-xs font-medium text-foreground/75"
          suppressHydrationWarning
        >
          Online tutoring and courses on TeacherPoint
        </p>
        <h1
          className="hero-headline mx-auto mt-4 max-w-4xl text-center font-display text-4xl font-extrabold tracking-tight drop-shadow-sm sm:text-5xl lg:text-6xl"
          suppressHydrationWarning
        >
          <span className="hero-title-lead block">Find expert tutors and courses that fit</span>
          <span className="hero-title-accent mt-1 block">your goals</span>
        </h1>
        <p
          className="mx-auto mt-4 max-w-2xl text-center text-base leading-relaxed text-foreground/80 sm:text-lg"
          suppressHydrationWarning
        >
          Book live sessions with teachers, learn at your pace, and earn shareable course certificates when
          offered on a program.
        </p>
        <div className="mt-8 min-h-[168px] md:min-h-[280px]">{children}</div>
      </div>
    </section>
  );
}
