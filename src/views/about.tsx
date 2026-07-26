"use client";

import { useTranslation } from "react-i18next";
import { Heart, Globe, Award, Users } from "lucide-react";
import { STATS } from "@/data/mock";
import { canonicalUrl } from "@/lib/site-config";

const STAT_LABEL_KEYS = ["stats.tutors", "stats.students", "stats.rating", "stats.countries"] as const;

function About() {
  const { t } = useTranslation("common");
  const values = [
    { icon: Heart, key: "v1" },
    { icon: Globe, key: "v2" },
    { icon: Award, key: "v3" },
  ];
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="max-w-3xl">
        <h1 className="font-display font-extrabold text-4xl md:text-5xl">{t("about.title")}</h1>
        <p className="mt-5 text-lg text-muted-foreground">{t("about.subtitle")}</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 my-12">
        {STATS.map((s, i) => (
          <div key={STAT_LABEL_KEYS[i] ?? s.label} className="bg-card border rounded-2xl p-6">
            <div className="font-display font-extrabold text-3xl text-gradient-primary">{s.value}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {STAT_LABEL_KEYS[i] ? t(STAT_LABEL_KEYS[i]) : t(`about.stat.${i + 1}`, s.label)}
            </div>
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {values.map((v) => (
          <div key={v.key} className="bg-card border rounded-2xl p-6">
            <v.icon className="h-8 w-8 text-primary" />
            <h3 className="font-display font-bold text-lg mt-3">{t(`about.${v.key}.title`)}</h3>
            <p className="text-sm text-muted-foreground mt-2">{t(`about.${v.key}.desc`)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default About;
