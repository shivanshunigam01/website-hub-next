"use client";

import { useTranslation } from "react-i18next";
import { FileText } from "lucide-react";
import { SectionLanding } from "@/components/landing/SectionLanding";

function Page() {
  const { t } = useTranslation("common");
  return (
    <SectionLanding
      eyebrow={t("assignmentHelp.eyebrow")}
      title={t("assignmentHelp.title")}
      highlight={t("assignmentHelp.highlight")}
      description={t("assignmentHelp.description")}
      icon={FileText}
      accent="primary"
      features={[
        {
          title: t("assignmentHelp.f1.title", "Subject specialists"),
          description: t(
            "assignmentHelp.f1.desc",
            "From STEM to humanities — matched with a vetted expert in your field.",
          ),
        },
        {
          title: t("assignmentHelp.f2.title", "Originality guaranteed"),
          description: t(
            "assignmentHelp.f2.desc",
            "Every submission passes a plagiarism check before delivery.",
          ),
        },
        {
          title: t("assignmentHelp.f3.title", "Milestone delivery"),
          description: t(
            "assignmentHelp.f3.desc",
            "Long projects broken into stages so you can review as we go.",
          ),
        },
        {
          title: t("assignmentHelp.f4.title", "Direct chat"),
          description: t(
            "assignmentHelp.f4.desc",
            "Talk to your expert anytime, share files, and request revisions.",
          ),
        },
        {
          title: t("assignmentHelp.f5.title", "Free revisions"),
          description: t(
            "assignmentHelp.f5.desc",
            "Two rounds of revisions included on every assignment.",
          ),
        },
        {
          title: t("assignmentHelp.f6.title", "Secure payments"),
          description: t(
            "assignmentHelp.f6.desc",
            "Funds held in escrow and released only on approval.",
          ),
        },
      ]}
      primaryCta={{ label: t("assignmentHelp.ctaPrimary"), to: "/post-requirement" }}
      secondaryCta={{ label: t("assignmentHelp.ctaSecondary"), to: "/tutors" }}
    />
  );
}

export default Page;
