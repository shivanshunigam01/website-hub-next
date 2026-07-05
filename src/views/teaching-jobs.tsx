"use client";


import { Briefcase } from "lucide-react";
import { SectionLanding } from "@/components/landing/SectionLanding";



function Page() {
  return (
    <SectionLanding
      eyebrow="For teachers · Free to apply"
      title="Teaching jobs"
      highlight="you'll love."
      description="Real requirements from real students and parents. Pick the format that fits — online, home, or institutional — and start earning."
      icon={Briefcase}
      accent="accent"
      features={[
        { title: "Verified requirements", description: "Every job is reviewed before going live — no spam, no time-wasters." },
        { title: "Smart matching", description: "Get alerts for jobs that match your subjects, location and rate." },
        { title: "Direct contact", description: "Message students directly — no recruiter middlemen." },
        { title: "Build your reputation", description: "Collect reviews and unlock premium leads." },
        { title: "Set your rate", description: "Quote what you're worth — students see and compare openly." },
        { title: "Get paid fast", description: "Weekly payouts straight to your bank." },
      ]}
      primaryCta={{ label: "Browse all jobs", to: "/tutor-jobs" }}
      secondaryCta={{ label: "Create teacher profile", to: "/register" }}
    />
  );
}

export default Page;
