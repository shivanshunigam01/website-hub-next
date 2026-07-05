"use client";


import { FileText } from "lucide-react";
import { SectionLanding } from "@/components/landing/SectionLanding";



function Page() {
  return (
    <SectionLanding
      eyebrow="Deadlines · Solved"
      title="Assignment help"
      highlight="from real experts."
      description="Share your brief and get quotes from subject experts within minutes. Original work, on-time delivery, plagiarism-free."
      icon={FileText}
      accent="primary"
      features={[
        { title: "Subject specialists", description: "From STEM to humanities — matched with a vetted expert in your field." },
        { title: "Originality guaranteed", description: "Every submission passes a plagiarism check before delivery." },
        { title: "Milestone delivery", description: "Long projects broken into stages so you can review as we go." },
        { title: "Direct chat", description: "Talk to your expert anytime, share files, and request revisions." },
        { title: "Free revisions", description: "Two rounds of revisions included on every assignment." },
        { title: "Secure payments", description: "Funds held in escrow and released only on approval." },
      ]}
      primaryCta={{ label: "Post your assignment", to: "/post-requirement" }}
      secondaryCta={{ label: "Browse experts", to: "/tutors" }}
    />
  );
}

export default Page;
