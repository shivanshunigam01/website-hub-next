"use client";

import { Link } from "@/lib/navigation";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Sparkles, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export type LandingFeature = { title: string; description: string };

export type SectionLandingProps = {
  eyebrow: string;
  title: string;
  highlight?: string;
  description: string;
  icon: LucideIcon;
  accent?: "primary" | "accent";
  features: LandingFeature[];
  primaryCta: { label: string; to: string };
  secondaryCta?: { label: string; to: string };
  stats?: { label: string; value: string }[];
};

export function SectionLanding({
  eyebrow,
  title,
  highlight,
  description,
  icon: Icon,
  accent = "primary",
  features,
  primaryCta,
  secondaryCta,
  stats,
}: SectionLandingProps) {
  const { t } = useTranslation("common");
  const accentText = accent === "primary" ? "text-primary" : "text-accent";
  const accentBg = accent === "primary" ? "bg-primary" : "bg-accent";
  const accentRing =
    accent === "primary"
      ? "from-primary/20 via-primary/5 to-transparent"
      : "from-accent/20 via-accent/5 to-transparent";

  return (
    <div className="relative overflow-hidden">
      {/* Hero */}
      <section className="relative">
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 -top-40 h-[520px] bg-gradient-to-b ${accentRing} blur-3xl`}
        />
        <div className="container relative mx-auto px-4 pt-20 pb-16 sm:pt-28 sm:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className={`mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium ${accentText}`}>
              <Sparkles className="h-3.5 w-3.5" />
              {eyebrow}
            </div>
            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-6xl">
              {title}{" "}
              {highlight && (
                <span className={`${accentText} relative`}>
                  {highlight}
                  <span className={`absolute -bottom-1 left-0 right-0 h-1 ${accentBg} opacity-30 rounded-full`} />
                </span>
              )}
            </h1>
            <p className="mt-6 text-pretty text-lg text-muted-foreground sm:text-xl">
              {description}
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" variant="gradient" className="w-full gap-2 sm:w-auto">
                <Link to={primaryCta.to as string}>
                  {primaryCta.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              {secondaryCta && (
                <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                  <Link to={secondaryCta.to as string}>{secondaryCta.label}</Link>
                </Button>
              )}
            </div>
          </motion.div>

          {/* Icon mark */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mx-auto mt-14 grid h-24 w-24 place-items-center rounded-2xl border border-border bg-card shadow-lg"
          >
            <Icon className={`h-10 w-10 ${accentText}`} />
          </motion.div>

          {stats && stats.length > 0 && (
            <div className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="rounded-xl border border-border bg-card/60 p-4 text-center backdrop-blur">
                  <div className={`text-2xl font-bold ${accentText}`}>{s.value}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border/60 bg-muted/30 py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <CheckCircle2 className={`h-5 w-5 ${accentText}`} />
                <h3 className="mt-4 text-lg font-semibold tracking-tight">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-border bg-card p-8 text-center sm:p-12">
            <div aria-hidden className={`absolute inset-0 bg-gradient-to-br ${accentRing}`} />
            <div className="relative">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {t("sectionLanding.readyTitle", "Ready to get started?")}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                {t(
                  "sectionLanding.readyDesc",
                  "Join thousands already using TeacherPoint to connect, learn, and grow.",
                )}
              </p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" variant="gradient" className="w-full gap-2 sm:w-auto">
                  <Link to={primaryCta.to as string}>
                    {primaryCta.label}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="ghost" className="w-full sm:w-auto">
                  <Link to="/register" search={{ role: "student" }}>
                    {t("sectionLanding.createAccount", "Create free account")}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
