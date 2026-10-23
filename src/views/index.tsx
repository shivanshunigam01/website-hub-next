"use client";

import dynamic from "next/dynamic";
import { GeoContentStrip } from "@/components/home/GeoContentStrip";
import { QuickLinks } from "@/components/home/QuickLinks";
import { LevelUpSection } from "@/components/home/LevelUpSection";
import { TrustStats, FAQSection, CTABand } from "@/components/home/Sections";
import { PopularSubjectsSeo } from "@/components/seo/PopularSubjectsSeo";

const TrendingCourses = dynamic(
  () => import("@/components/home/Sections").then((m) => m.TrendingCourses),
  { loading: () => <div className="min-h-[680px] w-full" aria-hidden /> },
);

const TopTutors = dynamic(
  () => import("@/components/home/TopTutors").then((m) => m.TopTutors),
  { loading: () => <div className="min-h-[640px] w-full" aria-hidden /> },
);

function HomePage() {
  return (
    <>
      <GeoContentStrip placement="hero-strip" limit={2} />
      <QuickLinks />
      <LevelUpSection />
      <TrustStats />
      <GeoContentStrip placement="inline-banner" limit={2} withHeading={false} className="pt-0" />
      <TrendingCourses />
      <TopTutors />
      <PopularSubjectsSeo />
      <FAQSection />
      <CTABand />
    </>
  );
}

export default HomePage;
