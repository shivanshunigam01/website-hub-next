"use client";

import dynamic from "next/dynamic";
import { Hero } from "@/components/home/Hero";

const sectionShell = (minH: string) => () => <div className={minH} aria-hidden />;

const GeoContentStrip = dynamic(
  () => import("@/components/home/GeoContentStrip").then((m) => m.GeoContentStrip),
  { loading: sectionShell("min-h-[min(42vw,320px)] md:min-h-[280px]") },
);
const QuickLinks = dynamic(
  () => import("@/components/home/QuickLinks").then((m) => m.QuickLinks),
  { loading: sectionShell("min-h-[220px]") },
);
const LevelUpSection = dynamic(
  () => import("@/components/home/LevelUpSection").then((m) => m.LevelUpSection),
  { loading: sectionShell("min-h-[280px]") },
);
const TrustStats = dynamic(
  () => import("@/components/home/Sections").then((m) => m.TrustStats),
  { loading: sectionShell("min-h-[120px]") },
);
const TrendingCourses = dynamic(
  () => import("@/components/home/Sections").then((m) => m.TrendingCourses),
  { loading: sectionShell("min-h-[620px]") },
);
const TopTutors = dynamic(
  () => import("@/components/home/TopTutors").then((m) => m.TopTutors),
  { loading: sectionShell("min-h-[480px]") },
);
const PopularSubjectsSeo = dynamic(
  () => import("@/components/seo/PopularSubjectsSeo").then((m) => m.PopularSubjectsSeo),
  { loading: sectionShell("min-h-[240px]") },
);
const FAQSection = dynamic(
  () => import("@/components/home/Sections").then((m) => m.FAQSection),
  { loading: sectionShell("min-h-[360px]") },
);
const CTABand = dynamic(
  () => import("@/components/home/Sections").then((m) => m.CTABand),
  { loading: sectionShell("min-h-[200px]") },
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
