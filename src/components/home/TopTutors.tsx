"use client";

import { Link } from "@/lib/navigation";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/SectionHeading";
import { TutorCard } from "@/components/cards/TutorCard";
import { useTutors } from "@/hooks/use-catalog";

export function TopTutors() {
  const { t } = useTranslation("common");
  const { data: tutors = [], isLoading } = useTutors(50);
  const top = [...tutors]
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || (b.reviews ?? 0) - (a.reviews ?? 0))
    .slice(0, 8);

  return (
    <section className="container mx-auto px-4 py-12 md:py-16">
      <SectionHeading
        eyebrow={t("topTutors.eyebrow")}
        title={t("topTutors.title")}
        subtitle={t("topTutors.subtitle")}
        action={
          <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
            <Link to="/tutors">
              {t("topTutors.viewAll")} <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        }
      />
      {isLoading ? (
        <div className="grid min-h-[600px] gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-hidden>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[280px] animate-pulse rounded-2xl border bg-muted/40" />
          ))}
        </div>
      ) : top.length === 0 ? (
        <p className="rounded-2xl border border-dashed bg-muted/20 px-6 py-12 text-center text-sm text-muted-foreground">
          {t("topTutors.empty")}
        </p>
      ) : (
        <div className="grid min-h-[600px] gap-5 sm:grid-cols-2 lg:grid-cols-4 content-start">
          {top.map((t, i) => (
            <TutorCard key={t.id} tutor={t} priorityImage={i < 4} />
          ))}
        </div>
      )}
      <div className="mt-6 flex md:hidden">
        <Button asChild variant="outline" size="lg" className="w-full">
          <Link to="/tutors">
            {t("topTutors.viewAllMobile")} <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
