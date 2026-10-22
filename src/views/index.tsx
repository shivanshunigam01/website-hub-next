"use client";

import dynamic from "next/dynamic";
import { Hero } from "@/components/home/Sections";

const GeoContentStrip = dynamic(
  () => import("@/components/home/GeoContentStrip").then((m) => m.GeoContentStrip),
  { loading: () => <div className="min-h-[200px]" aria-hidden /> },
);
const QuickLinks = dynamic(
  () => import("@/components/home/QuickLinks").then((m) => m.QuickLinks),
  { loading: () => <div className="min-h-[200px]" aria-hidden /> },
);
const LevelUpSection = dynamic(
  () => import("@/components/home/LevelUpSection").then((m) => m.LevelUpSection),
  { loading: () => <div className="min-h-[200px]" aria-hidden /> },
);
const TrustStats = dynamic(
  () => import("@/components/home/Sections").then((m) => m.TrustStats),
  { loading: () => <div className="min-h-[200px]" aria-hidden /> },
);
const TrendingCourses = dynamic(
  () => import("@/components/home/Sections").then((m) => m.TrendingCourses),
  { loading: () => <div className="min-h-[200px]" aria-hidden /> },
);
const TopTutors = dynamic(
  () => import("@/components/home/TopTutors").then((m) => m.TopTutors),
  { loading: () => <div className="min-h-[200px]" aria-hidden /> },
);
const PopularSubjectsSeo = dynamic(
  () => import("@/components/seo/PopularSubjectsSeo").then((m) => m.PopularSubjectsSeo),
  { loading: () => <div className="min-h-[200px]" aria-hidden /> },
);
const FAQSection = dynamic(
  () => import("@/components/home/Sections").then((m) => m.FAQSection),
  { loading: () => <div className="min-h-[200px]" aria-hidden /> },
);
const CTABand = dynamic(
  () => import("@/components/home/Sections").then((m) => m.CTABand),
  { loading: () => <div className="min-h-[200px]" aria-hidden /> },
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
