"use client";

import { useTranslation } from "react-i18next";
import { Video } from "lucide-react";
import { SectionLanding } from "@/components/landing/SectionLanding";

function Page() {
  const { t } = useTranslation("common");
  return (
    <SectionLanding
      eyebrow={t("onlineTutors.eyebrow")}
      title={t("onlineTutors.title")}
      highlight={t("onlineTutors.highlight")}
      description={t("onlineTutors.description")}
      icon={Video}
      accent="primary"
      features={[
        {
          title: t("onlineTutors.f1.title", "HD video classes"),
          description: t(
            "onlineTutors.f1.desc",
            "Built-in classroom with whiteboard, screen-share, and recordings.",
          ),
        },
        {
          title: t("onlineTutors.f2.title", "Flexible booking"),
          description: t(
            "onlineTutors.f2.desc",
            "Single sessions or weekly plans — reschedule anytime up to 12h before.",
          ),
        },
        {
          title: t("onlineTutors.f3.title", "Verified profiles"),
          description: t(
            "onlineTutors.f3.desc",
            "Every tutor is ID-checked with reviews from real students.",
          ),
        },
        {
          title: t("onlineTutors.f4.title", "Try-before-you-buy"),
          description: t(
            "onlineTutors.f4.desc",
            "Most tutors offer a free 20-min intro call.",
          ),
        },
        {
          title: t("onlineTutors.f5.title", "Pay per session"),
          description: t(
            "onlineTutors.f5.desc",
            "No subscriptions. Refund guarantee on first session.",
          ),
        },
        {
          title: t("onlineTutors.f6.title", "Global timezone match"),
          description: t(
            "onlineTutors.f6.desc",
            "Filter by your local hours and language.",
          ),
        },
      ]}
      primaryCta={{ label: t("onlineTutors.ctaPrimary"), to: "/tutors" }}
      secondaryCta={{ label: t("onlineTutors.ctaSecondary"), to: "/post-requirement" }}
    />
  );
}

export default Page;
