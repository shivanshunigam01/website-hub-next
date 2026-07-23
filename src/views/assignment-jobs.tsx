"use client";


import { ClipboardList } from "lucide-react";
import { SectionLanding } from "@/components/landing/SectionLanding";



function Page() {
  return (
    <SectionLanding
      eyebrow="Freelance · Pay per task"
      title="Assignment jobs"
      highlight="for experts."
      description="Pick assignments in your strongest subjects, quote your price, and get paid as soon as the student approves."
      icon={ClipboardList}
      accent="accent"
      features={[
        { title: "Daily fresh briefs", description: "New assignments posted across STEM, business, humanities and more." },
        { title: "Quote freely", description: "Set your own price for each brief — no platform-imposed rates." },
        { title: "Escrow protected", description: "Student funds are locked before you start so you always get paid." },
        { title: "Build your portfolio", description: "Completed jobs and reviews unlock higher-value briefs." },
        { title: "Direct chat", description: "Clarify scope with students upfront to avoid scope creep." },
        { title: "Bonus on excellence", description: "Top-rated experts receive priority access to premium briefs." },
      ]}
      primaryCta={{ label: "Browse assignments", to: "/tutor-jobs?jobType=assignment" }}
      secondaryCta={{ label: "Become an expert", to: "/register" }}
    />
  );
}

export default Page;
