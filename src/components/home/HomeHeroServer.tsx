import Image from "next/image";
import type { ReactNode } from "react";
import heroPoster from "@/assets/hero-illustration.jpg";

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
      {videoSlot}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden [contain:paint]">
        <Image
          src={heroPoster}
          alt=""
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          placeholder="blur"
          className="object-cover opacity-90 dark:opacity-75"
        />
        <div className="absolute inset-0 bg-background/30 dark:bg-background/50" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/25 via-background/15 to-background/60" />
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
        <div className="mt-8 min-h-[168px] md:min-h-[200px]">{children}</div>
      </div>
    </section>
  );
}
