"use client";


import { Video } from "lucide-react";
import { SectionLanding } from "@/components/landing/SectionLanding";



function Page() {
  return (
    <SectionLanding
      eyebrow="Live · 1-on-1 · Anywhere"
      title="Online tutors,"
      highlight="on your schedule."
      description="Connect over high-quality video with vetted tutors across 100+ subjects. Book by the hour, no long contracts."
      icon={Video}
      accent="primary"
      features={[
        { title: "HD video classes", description: "Built-in classroom with whiteboard, screen-share, and recordings." },
        { title: "Flexible booking", description: "Single sessions or weekly plans — reschedule anytime up to 12h before." },
        { title: "Verified profiles", description: "Every tutor is ID-checked with reviews from real students." },
        { title: "Try-before-you-buy", description: "Most tutors offer a free 20-min intro call." },
        { title: "Pay per session", description: "No subscriptions. Refund guarantee on first session." },
        { title: "Global timezone match", description: "Filter by your local hours and language." },
      ]}
      primaryCta={{ label: "Browse online tutors", to: "/tutors" }}
      secondaryCta={{ label: "Post a requirement", to: "/post-requirement" }}
    />
  );
}

export default Page;
