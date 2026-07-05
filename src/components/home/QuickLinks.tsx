"use client";

import { Link } from "@/lib/navigation";
import { GraduationCap, Briefcase, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

type Item = { label: string; to: string };

const teachers: Item[] = [
  { label: "Teachers", to: "/tutors" },
  { label: "Online Teachers", to: "/online-tutors" },
  { label: "Home Teachers", to: "/home-tutors" },
  { label: "Assignment Help", to: "/assignment-help" },
];

const jobs: Item[] = [
  { label: "Teaching Jobs", to: "/teaching-jobs" },
  { label: "Online Teaching", to: "/online-teaching" },
  { label: "Home Teaching", to: "/home-teaching" },
  { label: "Assignment Jobs", to: "/assignment-jobs" },
];

function Group({
  title,
  icon: Icon,
  items,
  accent,
}: {
  title: string;
  icon: typeof GraduationCap;
  items: Item[];
  accent: "primary" | "accent";
}) {
  const ring =
    accent === "primary"
      ? "from-primary/15 to-primary/0 group-hover:from-primary/25"
      : "from-accent/15 to-accent/0 group-hover:from-accent/25";
  const dot = accent === "primary" ? "bg-primary" : "bg-accent";
  const text = accent === "primary" ? "text-primary" : "text-accent";

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className={`grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br ${ring} ring-1 ring-border/60`}>
          <Icon className={`h-4.5 w-4.5 ${text}`} />
        </div>
        <h3 className={`text-xl font-semibold tracking-tight ${text}`}>{title}</h3>
        <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {items.map((it, i) => (
          <motion.div
            key={it.label}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.35, delay: i * 0.04 }}
          >
            <Link
              to={it.to as string}
              className="group relative flex items-center justify-between overflow-hidden rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground/90 shadow-sm transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md"
            >
              <span className="flex items-center gap-2.5">
                <span className={`h-1.5 w-1.5 rounded-full ${dot} opacity-70 transition-opacity group-hover:opacity-100`} />
                {it.label}
              </span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-all group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              <span className={`pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r ${ring}`} />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function QuickLinks() {
  return (
    <section className="py-16 sm:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2 md:gap-14">
          <Group title="Teachers" icon={GraduationCap} items={teachers} accent="primary" />
          <Group title="Teaching Jobs" icon={Briefcase} items={jobs} accent="primary" />
        </div>
      </div>
    </section>
  );
}
