"use client";

import { useTranslation } from "react-i18next";
import { Globe2 } from "lucide-react";
import { SectionLanding } from "@/components/landing/SectionLanding";

function Page() {
  const { t } = useTranslation("common");
  return (
    <SectionLanding
      eyebrow={t("onlineTeaching.eyebrow")}
      title={t("onlineTeaching.title")}
      highlight={t("onlineTeaching.highlight")}
      description={t("onlineTeaching.description")}
      icon={Globe2}
      accent="accent"
      features={[
        {
          title: t("onlineTeaching.f1.title", "Built-in classroom"),
          description: t(
            "onlineTeaching.f1.desc",
            "HD video, interactive whiteboard, recordings — all included free.",
          ),
        },
        {
          title: t("onlineTeaching.f2.title", "Global student base"),
          description: t(
            "onlineTeaching.f2.desc",
            "Match with learners in time zones that fit your schedule.",
          ),
        },
        {
          title: t("onlineTeaching.f3.title", "Flexible hours"),
          description: t(
            "onlineTeaching.f3.desc",
            "Teach 5 or 50 hours a week — you're fully in control.",
          ),
        },
        {
          title: t("onlineTeaching.f4.title", "Instant booking"),
          description: t(
            "onlineTeaching.f4.desc",
            "Students book directly into your calendar with no back-and-forth.",
          ),
        },
        {
          title: t("onlineTeaching.f5.title", "Multi-currency payouts"),
          description: t(
            "onlineTeaching.f5.desc",
            "Withdraw to your bank in your local currency.",
          ),
        },
        {
          title: t("onlineTeaching.f6.title", "Marketing boost"),
          description: t(
            "onlineTeaching.f6.desc",
            "Featured profiles for top-rated online tutors.",
          ),
        },
      ]}
      primaryCta={{ label: t("onlineTeaching.ctaPrimary"), to: "/register" }}
      secondaryCta={{ label: t("onlineTeaching.ctaSecondary"), to: "/post-requirement" }}
    />
  );
}

export default Page;
