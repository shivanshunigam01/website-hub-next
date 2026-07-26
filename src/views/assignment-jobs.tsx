"use client";

import { useTranslation } from "react-i18next";
import { ClipboardList } from "lucide-react";
import { SectionLanding } from "@/components/landing/SectionLanding";

function Page() {
  const { t } = useTranslation("common");
  return (
    <SectionLanding
      eyebrow={t("assignmentJobs.eyebrow")}
      title={t("assignmentJobs.title")}
      highlight={t("assignmentJobs.highlight")}
      description={t("assignmentJobs.description")}
      icon={ClipboardList}
      accent="accent"
      features={[
        {
          title: t("assignmentJobs.f1.title", "Daily fresh briefs"),
          description: t(
            "assignmentJobs.f1.desc",
            "New assignments posted across STEM, business, humanities and more.",
          ),
        },
        {
          title: t("assignmentJobs.f2.title", "Quote freely"),
          description: t(
            "assignmentJobs.f2.desc",
            "Set your own price for each brief — no platform-imposed rates.",
          ),
        },
        {
          title: t("assignmentJobs.f3.title", "Escrow protected"),
          description: t(
            "assignmentJobs.f3.desc",
            "Student funds are locked before you start so you always get paid.",
          ),
        },
        {
          title: t("assignmentJobs.f4.title", "Build your portfolio"),
          description: t(
            "assignmentJobs.f4.desc",
            "Completed jobs and reviews unlock higher-value briefs.",
          ),
        },
        {
          title: t("assignmentJobs.f5.title", "Direct chat"),
          description: t(
            "assignmentJobs.f5.desc",
            "Clarify scope with students upfront to avoid scope creep.",
          ),
        },
        {
          title: t("assignmentJobs.f6.title", "Bonus on excellence"),
          description: t(
            "assignmentJobs.f6.desc",
            "Top-rated experts receive priority access to premium briefs.",
          ),
        },
      ]}
      primaryCta={{ label: t("assignmentJobs.ctaPrimary"), to: "/tutor-jobs?jobType=assignment" }}
      secondaryCta={{ label: t("assignmentJobs.ctaSecondary"), to: "/register" }}
    />
  );
}

export default Page;
