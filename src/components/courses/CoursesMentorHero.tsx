"use client";

import { Link } from "@/lib/navigation";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeferredBackgroundVideo } from "@/components/DeferredBackgroundVideo";

export const COURSES_HERO_VIDEO = "/videos/courses-hero.mp4?v=2";
export const COURSES_HERO_POSTER = "/videos/courses-hero-poster.jpg?v=2";

export function CoursesMentorHero() {
  const { t } = useTranslation("common");
  return (
    <section className="container mx-auto px-4 py-6 sm:py-8">
      <article className="group relative isolate overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="relative aspect-[16/7] min-h-[220px] w-full overflow-hidden bg-slate-900 sm:min-h-[280px]">
          <DeferredBackgroundVideo
            src={COURSES_HERO_VIDEO}
            poster={COURSES_HERO_POSTER}
            desktopDelayMs={1500}
            mobileDelayMs={4000}
          />

          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/55 to-slate-900/15" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />

          <div className="relative z-10 flex h-full flex-col justify-center gap-2 p-5 sm:max-w-[62%] sm:p-8 md:p-10">
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl md:text-4xl">
              {t("coursesHero.title")}
            </h2>
            <p className="line-clamp-2 text-sm text-white/85 sm:text-base md:text-lg">
              {t("coursesHero.subtitle")}
            </p>
            <div className="pt-2">
              <Button asChild size="lg" className="bg-white text-slate-900 shadow-lg hover:bg-white/90">
                <Link to="/tutors">
                  {t("coursesHero.cta")}
                  <ArrowRight className="ms-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}
