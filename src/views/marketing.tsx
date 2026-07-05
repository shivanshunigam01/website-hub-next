"use client";

import { Link } from "@/lib/navigation";
import { Share2, Link2, Award, TrendingUp, Globe2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { canonicalUrl } from "@/lib/site-config";

const PARTNERS = [
  { name: "EduWorld", url: "https://eduworld.example", desc: "Online learning network" },
  { name: "ScholarHub", url: "https://scholarhub.example", desc: "Scholarship aggregator" },
  { name: "TutorVerse", url: "https://tutorverse.example", desc: "Global tutor directory" },
  { name: "StudyAbroad+", url: "https://studyabroad.example", desc: "International student services" },
  { name: "LearnDaily", url: "https://learndaily.example", desc: "Daily learning newsletter" },
  { name: "MyCampus", url: "https://mycampus.example", desc: "Campus community platform" },
];

function MarketingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl">
        <Badge variant="outline" className="mb-3">SEO & Growth</Badge>
        <h1 className="font-display text-4xl font-extrabold tracking-tight">Marketing & Partner Network</h1>
        <p className="mt-3 text-muted-foreground">
          Our partner network helps students and tutors discover TeacherPoint across the web.
          Below are partner backlinks and assets you can share to grow with us.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mt-8">
        {[
          { icon: TrendingUp, label: "Monthly visits", value: "1.2M+" },
          { icon: Globe2, label: "Countries", value: "60+" },
          { icon: Award, label: "Verified tutors", value: "12,500+" },
        ].map((s) => (
          <div key={s.label} className="border rounded-2xl p-5 bg-card">
            <s.icon className="h-6 w-6 text-primary" />
            <div className="mt-2 text-2xl font-display font-extrabold">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <h2 className="font-display text-2xl font-bold mt-12 mb-4 flex items-center gap-2"><Link2 className="h-5 w-5" /> Partner backlinks</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PARTNERS.map((p) => (
          <a
            key={p.name}
            href={p.url}
            rel="dofollow noopener"
            target="_blank"
            className="group border rounded-2xl p-5 bg-card hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <div className="font-display font-bold">{p.name}</div>
              <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
            </div>
            <div className="text-sm text-muted-foreground mt-1">{p.desc}</div>
            <div className="text-xs text-primary mt-3 break-all">{p.url}</div>
          </a>
        ))}
      </div>

      <div className="mt-12 border rounded-2xl p-6 bg-gradient-to-br from-primary/5 to-purple-soft/30 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-xl font-bold flex items-center gap-2"><Share2 className="h-5 w-5" /> Share kit</h3>
          <p className="text-sm text-muted-foreground mt-1">Banner images, copy and embed snippets to promote TeacherPoint.</p>
        </div>
        <Button asChild size="lg" variant="gradient"><Link to="/contact">Request kit</Link></Button>
      </div>
    </div>
  );
}

export default MarketingPage;
