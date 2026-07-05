"use client";

import dynamic from "next/dynamic";
import { Hero } from "@/components/home/Sections";

const GeoContentStrip = dynamic(
  () => import("@/components/home/GeoContentStrip").then((m) => m.GeoContentStrip),
  { loading: () => null },
);
const QuickLinks = dynamic(
  () => import("@/components/home/QuickLinks").then((m) => m.QuickLinks),
  { loading: () => null },
);
const LevelUpSection = dynamic(
  () => import("@/components/home/LevelUpSection").then((m) => m.LevelUpSection),
  { loading: () => null },
);
const TrustStats = dynamic(
  () => import("@/components/home/Sections").then((m) => m.TrustStats),
  { loading: () => null },
);
const TrendingCourses = dynamic(
  () => import("@/components/home/Sections").then((m) => m.TrendingCourses),
  { loading: () => null },
);
const TopTutors = dynamic(
  () => import("@/components/home/TopTutors").then((m) => m.TopTutors),
  { loading: () => null },
);
const PopularSubjectsSeo = dynamic(
  () => import("@/components/seo/PopularSubjectsSeo").then((m) => m.PopularSubjectsSeo),
  { loading: () => null },
);
const FAQSection = dynamic(
  () => import("@/components/home/Sections").then((m) => m.FAQSection),
  { loading: () => null },
);
const CTABand = dynamic(
  () => import("@/components/home/Sections").then((m) => m.CTABand),
  { loading: () => null },
);

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
