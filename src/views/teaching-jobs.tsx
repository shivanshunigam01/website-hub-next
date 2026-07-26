"use client";

import { useTranslation } from "react-i18next";
import { Briefcase } from "lucide-react";
import { SectionLanding } from "@/components/landing/SectionLanding";

function Page() {
  const { t } = useTranslation("common");
  return (
    <SectionLanding
      eyebrow={t("teachingJobs.eyebrow")}
      title={t("teachingJobs.title")}
      highlight={t("teachingJobs.highlight")}
      description={t("teachingJobs.description")}
      icon={Briefcase}
      accent="accent"
      features={[
        {
          title: t("teachingJobs.f1.title", "Verified requirements"),
          description: t(
            "teachingJobs.f1.desc",
            "Every job is reviewed before going live — no spam, no time-wasters.",
          ),
        },
        {
          title: t("teachingJobs.f2.title", "Smart matching"),
          description: t(
            "teachingJobs.f2.desc",
            "Get alerts for jobs that match your subjects, location and rate.",
          ),
        },
        {
          title: t("teachingJobs.f3.title", "Direct contact"),
          description: t(
            "teachingJobs.f3.desc",
            "Message students directly — no recruiter middlemen.",
          ),
        },
        {
          title: t("teachingJobs.f4.title", "Build your reputation"),
          description: t(
            "teachingJobs.f4.desc",
            "Collect reviews and unlock premium leads.",
          ),
        },
        {
          title: t("teachingJobs.f5.title", "Set your rate"),
          description: t(
            "teachingJobs.f5.desc",
            "Quote what you're worth — students see and compare openly.",
          ),
        },
        {
          title: t("teachingJobs.f6.title", "Get paid fast"),
          description: t(
            "teachingJobs.f6.desc",
            "Weekly payouts straight to your bank.",
          ),
        },
      ]}
      primaryCta={{ label: t("teachingJobs.ctaPrimary"), to: "/tutor-jobs" }}
      secondaryCta={{ label: t("teachingJobs.ctaSecondary"), to: "/register" }}
    />
  );
}

export default Page;
