"use client";

import dynamic from "next/dynamic";
import { QuickLinks } from "@/components/home/QuickLinks";
import {
  CtaLoader,
  FaqLoader,
  GeoStripLoader,
  LevelUpLoader,
  PopularSubjectsLoader,
  TopTutorsLoader,
  TrendingLoader,
  TrustStatsLoader,
} from "@/components/home/home-section-loaders";

const GeoContentStrip = dynamic(
  () => import("@/components/home/GeoContentStrip").then((m) => m.GeoContentStrip),
  { loading: () => <GeoStripLoader dual /> },
);

const LevelUpSection = dynamic(
  () => import("@/components/home/LevelUpSection").then((m) => m.LevelUpSection),
  { loading: () => <LevelUpLoader /> },
);

const TrustStats = dynamic(
  () => import("@/components/home/Sections").then((m) => m.TrustStats),
  { loading: () => <TrustStatsLoader /> },
);

const TrendingCourses = dynamic(
  () => import("@/components/home/Sections").then((m) => m.TrendingCourses),
  { loading: () => <TrendingLoader /> },
);

const TopTutors = dynamic(
  () => import("@/components/home/TopTutors").then((m) => m.TopTutors),
  { loading: () => <TopTutorsLoader /> },
);

const PopularSubjectsSeo = dynamic(
  () => import("@/components/seo/PopularSubjectsSeo").then((m) => m.PopularSubjectsSeo),
  { loading: () => <PopularSubjectsLoader /> },
);

const FAQSection = dynamic(
  () => import("@/components/home/Sections").then((m) => m.FAQSection),
  { loading: () => <FaqLoader /> },
);

const CTABand = dynamic(
  () => import("@/components/home/Sections").then((m) => m.CTABand),
  { loading: () => <CtaLoader /> },
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
