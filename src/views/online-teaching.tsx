"use client";


import { Globe2 } from "lucide-react";
import { SectionLanding } from "@/components/landing/SectionLanding";



function Page() {
  return (
    <SectionLanding
      eyebrow="Remote · Worldwide"
      title="Teach online,"
      highlight="from anywhere."
      description="Reach students globally with our built-in virtual classroom. Set your hours, set your rate, and start teaching this week."
      icon={Globe2}
      accent="accent"
      features={[
        { title: "Built-in classroom", description: "HD video, interactive whiteboard, recordings — all included free." },
        { title: "Global student base", description: "Match with learners in time zones that fit your schedule." },
        { title: "Flexible hours", description: "Teach 5 or 50 hours a week — you're fully in control." },
        { title: "Instant booking", description: "Students book directly into your calendar with no back-and-forth." },
        { title: "Multi-currency payouts", description: "Withdraw to your bank in your local currency." },
        { title: "Marketing boost", description: "Featured profiles for top-rated online tutors." },
      ]}
      primaryCta={{ label: "Start teaching online", to: "/register" }}
      secondaryCta={{ label: "See open jobs", to: "/post-requirement" }}
    />
  );
}

export default Page;
