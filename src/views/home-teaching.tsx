"use client";

import { useTranslation } from "react-i18next";
import { MapPin } from "lucide-react";
import { SectionLanding } from "@/components/landing/SectionLanding";

function Page() {
  const { t } = useTranslation("common");
  return (
    <SectionLanding
      eyebrow={t("homeTeaching.eyebrow")}
      title={t("homeTeaching.title")}
      highlight={t("homeTeaching.highlight")}
      description={t("homeTeaching.description")}
      icon={MapPin}
      accent="accent"
      features={[
        {
          title: t("homeTeaching.f1.title", "Radius matching"),
          description: t(
            "homeTeaching.f1.desc",
            "Only see jobs within your travel distance — no long commutes.",
          ),
        },
        {
          title: t("homeTeaching.f2.title", "Verified parents"),
          description: t(
            "homeTeaching.f2.desc",
            "Phone and address verified before requirements go live.",
          ),
        },
        {
          title: t("homeTeaching.f3.title", "Recurring income"),
          description: t(
            "homeTeaching.f3.desc",
            "Most home tuitions become long-term weekly engagements.",
          ),
        },
        {
          title: t("homeTeaching.f4.title", "Travel allowance"),
          description: t(
            "homeTeaching.f4.desc",
            "Many parents offer fuel / transport top-ups for distant slots.",
          ),
        },
        {
          title: t("homeTeaching.f5.title", "Transparent reviews"),
          description: t(
            "homeTeaching.f5.desc",
            "See parent ratings before you commit to any job.",
          ),
        },
        {
          title: t("homeTeaching.f6.title", "Safety first"),
          description: t(
            "homeTeaching.f6.desc",
            "Two-way verification keeps both tutor and student safe.",
          ),
        },
      ]}
      primaryCta={{ label: t("homeTeaching.ctaPrimary"), to: "/post-requirement" }}
      secondaryCta={{ label: t("homeTeaching.ctaSecondary"), to: "/register" }}
    />
  );
}

export default Page;
