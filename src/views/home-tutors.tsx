"use client";

import { useTranslation } from "react-i18next";
import { Home } from "lucide-react";
import { SectionLanding } from "@/components/landing/SectionLanding";

function Page() {
  const { t } = useTranslation("common");
  return (
    <SectionLanding
      eyebrow={t("homeTutors.eyebrow")}
      title={t("homeTutors.title")}
      highlight={t("homeTutors.highlight")}
      description={t("homeTutors.description")}
      icon={Home}
      accent="primary"
      features={[
        {
          title: t("homeTutors.f1.title", "Location-matched"),
          description: t(
            "homeTutors.f1.desc",
            "We filter tutors within your travel radius automatically.",
          ),
        },
        {
          title: t("homeTutors.f2.title", "Background verified"),
          description: t(
            "homeTutors.f2.desc",
            "ID + address verification for in-person safety.",
          ),
        },
        {
          title: t("homeTutors.f3.title", "Set your schedule"),
          description: t(
            "homeTutors.f3.desc",
            "Pick fixed weekly slots or one-off sessions.",
          ),
        },
        {
          title: t("homeTutors.f4.title", "Flat hourly rates"),
          description: t(
            "homeTutors.f4.desc",
            "Transparent pricing — no agency markup.",
          ),
        },
        {
          title: t("homeTutors.f5.title", "Parent dashboard"),
          description: t(
            "homeTutors.f5.desc",
            "Track attendance, progress and pay in one place.",
          ),
        },
        {
          title: t("homeTutors.f6.title", "Quick replacement"),
          description: t(
            "homeTutors.f6.desc",
            "Free replacement tutor if your first match isn't a fit.",
          ),
        },
      ]}
      primaryCta={{ label: t("homeTutors.ctaPrimary"), to: "/tutors" }}
      secondaryCta={{ label: t("homeTutors.ctaSecondary"), to: "/post-requirement" }}
    />
  );
}

export default Page;
