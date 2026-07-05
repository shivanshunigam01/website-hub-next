"use client";

import { Link } from "@/lib/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/SectionHeading";
import { TutorCard } from "@/components/cards/TutorCard";
import { useTutors } from "@/hooks/use-catalog";

export function TopTutors() {
  const { data: tutors = [], isLoading } = useTutors(50);
  const top = [...tutors]
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || (b.reviews ?? 0) - (a.reviews ?? 0))
    .slice(0, 8);

  return (
    <section className="container mx-auto px-4 py-12 md:py-16">
      <SectionHeading
        eyebrow="Top rated"
        title="Meet our top tutors"
        subtitle="Verified experts loved by thousands of students worldwide."
        action={
          <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
            <Link to="/tutors">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        }
      />
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : top.length === 0 ? (
        <p className="rounded-2xl border border-dashed bg-muted/20 px-6 py-12 text-center text-sm text-muted-foreground">
          Top tutors will appear here once verified tutor profiles are published.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {top.map((t) => (
            <TutorCard key={t.id} tutor={t} />
          ))}
        </div>
      )}
      <div className="mt-6 flex md:hidden">
        <Button asChild variant="outline" size="lg" className="w-full">
          <Link to="/tutors">
            View all tutors <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
