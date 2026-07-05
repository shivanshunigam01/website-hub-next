"use client";


import { MapPin } from "lucide-react";
import { SectionLanding } from "@/components/landing/SectionLanding";



function Page() {
  return (
    <SectionLanding
      eyebrow="In-person · Local"
      title="Home teaching jobs"
      highlight="near you."
      description="Get matched with families in your area. Set your travel radius, pick your rate, and teach in person."
      icon={MapPin}
      accent="accent"
      features={[
        { title: "Radius matching", description: "Only see jobs within your travel distance — no long commutes." },
        { title: "Verified parents", description: "Phone and address verified before requirements go live." },
        { title: "Recurring income", description: "Most home tuitions become long-term weekly engagements." },
        { title: "Travel allowance", description: "Many parents offer fuel / transport top-ups for distant slots." },
        { title: "Transparent reviews", description: "See parent ratings before you commit to any job." },
        { title: "Safety first", description: "Two-way verification keeps both tutor and student safe." },
      ]}
      primaryCta={{ label: "Find home tuition jobs", to: "/post-requirement" }}
      secondaryCta={{ label: "Create your profile", to: "/register" }}
    />
  );
}

export default Page;
