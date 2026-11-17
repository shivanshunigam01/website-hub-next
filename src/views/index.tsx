"use client";

import { GeoContentStrip } from "@/components/home/GeoContentStrip";
import { QuickLinks } from "@/components/home/QuickLinks";
import { LevelUpSection } from "@/components/home/LevelUpSection";
import { TrustStats, TrendingCourses, FAQSection, CTABand } from "@/components/home/Sections";
import { TopTutors } from "@/components/home/TopTutors";
import { PopularSubjectsSeo } from "@/components/seo/PopularSubjectsSeo";

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
