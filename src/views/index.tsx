"use client";


import { PopularSubjectsSeo } from "@/components/seo/PopularSubjectsSeo";
import { Hero, TrustStats, TrendingCourses, FAQSection, CTABand } from "@/components/home/Sections";
import { QuickLinks } from "@/components/home/QuickLinks";
import { LevelUpSection } from "@/components/home/LevelUpSection";
import { TopTutors } from "@/components/home/TopTutors";
import { GeoContentStrip } from "@/components/home/GeoContentStrip";
import { DEFAULT_PAGE_TITLE, SITE_DESCRIPTION, SITE_NAME, SITE_OG_IMAGE, SITE_URL, TWITTER_HANDLE } from "@/lib/site-config";



function HomePage() {
  return (
    <>
      <Hero />
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
