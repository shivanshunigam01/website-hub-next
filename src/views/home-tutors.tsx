"use client";


import { Home } from "lucide-react";
import { SectionLanding } from "@/components/landing/SectionLanding";



function Page() {
  return (
    <SectionLanding
      eyebrow="In-person · Near you"
      title="Home tutors who"
      highlight="come to you."
      description="Trusted local tutors for in-person sessions at your home. Background-checked, reviewed, and ready to start this week."
      icon={Home}
      accent="primary"
      features={[
        { title: "Location-matched", description: "We filter tutors within your travel radius automatically." },
        { title: "Background verified", description: "ID + address verification for in-person safety." },
        { title: "Set your schedule", description: "Pick fixed weekly slots or one-off sessions." },
        { title: "Flat hourly rates", description: "Transparent pricing — no agency markup." },
        { title: "Parent dashboard", description: "Track attendance, progress and pay in one place." },
        { title: "Quick replacement", description: "Free replacement tutor if your first match isn't a fit." },
      ]}
      primaryCta={{ label: "Find a home tutor", to: "/tutors" }}
      secondaryCta={{ label: "Post your requirement", to: "/post-requirement" }}
    />
  );
}

export default Page;
