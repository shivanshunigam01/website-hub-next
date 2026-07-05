"use client";

import { Heart, Globe, Award, Users } from "lucide-react";
import { STATS } from "@/data/mock";
import { canonicalUrl } from "@/lib/site-config";

function About() {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="max-w-3xl">
        <h1 className="font-display font-extrabold text-4xl md:text-5xl">We make great learning <span className="text-gradient-primary">universally accessible</span>.</h1>
        <p className="mt-5 text-lg text-muted-foreground">TeacherPoint connects 850K+ students, parents, and verified expert tutors across 120 countries through live sessions, on-demand courses, and certifications that move careers forward.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 my-12">
        {STATS.map((s) => (
          <div key={s.label} className="bg-card border rounded-2xl p-6">
            <div className="font-display font-extrabold text-3xl text-gradient-primary">{s.value}</div>
            <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { icon: Heart, title: "Student-first", desc: "Every product decision starts with: does this help students learn faster?" },
          { icon: Globe, title: "Global reach", desc: "Learners from 120 countries connecting with the world's best teachers." },
          { icon: Award, title: "Trust & quality", desc: "Every tutor verified. Every course reviewed. Every certificate earned." },
        ].map((v) => (
          <div key={v.title} className="bg-card border rounded-2xl p-6">
            <v.icon className="h-8 w-8 text-primary" />
            <h3 className="font-display font-bold text-lg mt-3">{v.title}</h3>
            <p className="text-sm text-muted-foreground mt-2">{v.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default About;
