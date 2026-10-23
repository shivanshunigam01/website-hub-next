import Image from "next/image";
import type { ReactNode } from "react";
import heroPoster from "@/assets/hero-illustration.jpg";

/** SSR hero shell — poster + headline paint before client hydration (mobile LCP). */
export function HomeHeroServer({
  children,
  videoSlot,
}: {
  children: ReactNode;
  videoSlot?: ReactNode;
}) {
  return (
    <section className="relative min-h-[min(88vh,760px)] overflow-hidden border-b bg-gradient-hero">
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

      <div className="container relative z-[1] mx-auto px-4 py-20 sm:px-6 md:py-28 lg:py-32">
        <div className="flex justify-center">
          <span
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-background/70 px-4 py-1.5 text-xs font-medium text-foreground/80 backdrop-blur-md shadow-sm"
            suppressHydrationWarning
          >
            Trusted by learners in 120+ countries
          </span>
        </div>
        <h1
          className="hero-headline mx-auto mt-6 min-h-[5.5rem] max-w-4xl text-center font-display text-4xl font-extrabold tracking-tight drop-shadow-sm sm:min-h-[6.5rem] sm:text-5xl lg:min-h-[7.5rem] lg:text-6xl"
          suppressHydrationWarning
        >
          <span className="hero-title-lead block min-h-[1.2em]">Find expert tutors and courses that fit</span>
          <span className="hero-title-accent mt-1 block min-h-[1.2em]">your goals</span>
        </h1>
        <p
          className="mx-auto mt-5 min-h-[4.5rem] max-w-2xl text-center text-base leading-relaxed text-foreground/80 sm:min-h-[3.5rem] sm:text-lg"
          suppressHydrationWarning
        >
          Book live sessions with verified teachers, learn at your own pace, and earn certificates you can share
          with employers.
        </p>
        {children}
      </div>
    </section>
  );
}
