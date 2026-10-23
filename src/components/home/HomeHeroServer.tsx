import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import heroPoster from "@/assets/hero-illustration.jpg";
import { Award, CheckCircle2, GraduationCap, ShieldCheck, Star, Users } from "lucide-react";

/** SSR hero shell — poster + headline + primary CTAs paint before client hydration (LCP / CLS). */
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

        <div className="min-h-[168px] md:min-h-[200px]">{children}</div>

        <div className="mt-7 flex min-h-[3rem] flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/tutors"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-primary to-primary/90 px-8 text-sm font-medium text-primary-foreground shadow transition hover:opacity-95 sm:w-auto"
          >
            <Users className="h-4 w-4" aria-hidden />
            Find a tutor
          </Link>
          <Link
            href="/courses"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border bg-background/70 px-8 text-sm font-medium backdrop-blur transition hover:bg-background sm:w-auto"
          >
            <GraduationCap className="h-4 w-4" aria-hidden />
            Browse courses
          </Link>
        </div>

        <ul className="mt-8 flex min-h-[1.5rem] flex-col items-center justify-center gap-3 text-sm text-foreground/80 sm:flex-row sm:gap-x-8">
          <li className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" aria-hidden />
            Verified tutors
          </li>
          <li className="hidden h-1 w-1 rounded-full bg-border sm:block" aria-hidden />
          <li className="flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-500" aria-hidden />
            Recognized certificates
          </li>
          <li className="hidden h-1 w-1 rounded-full bg-border sm:block" aria-hidden />
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden />
            Satisfaction guarantee
          </li>
        </ul>

        <div className="mx-auto mt-12 grid min-h-[5.5rem] max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
          <div className="flex items-center gap-3 rounded-2xl border bg-card/90 p-4 shadow-xl backdrop-blur">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Users className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">Students worldwide</p>
              <p className="mt-1 text-xs text-muted-foreground">Learn from anywhere</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border bg-card/90 p-4 shadow-xl backdrop-blur">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber-500/10">
              <Star className="h-5 w-5 fill-amber-500 text-amber-500" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">Top-rated teachers</p>
              <p className="mt-1 text-xs text-muted-foreground">Thousands of reviews</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
