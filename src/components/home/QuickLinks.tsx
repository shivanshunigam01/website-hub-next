"use client";

import { Link } from "@/lib/navigation";
import { useTranslation } from "react-i18next";
import { GraduationCap, Briefcase, ArrowUpRight } from "lucide-react";

type Item = { key: string; to: string; search?: Record<string, string> };

const teachers: Item[] = [
  { key: "quickLinks.teachers", to: "/tutors" },
  { key: "quickLinks.onlineTeachers", to: "/online-tutors" },
  { key: "quickLinks.homeTeachers", to: "/home-tutors" },
  { key: "quickLinks.assignmentHelp", to: "/assignment-help" },
];

/** Teaching Jobs → admin-verified tutor jobs board (approved student/parent posts). */
const jobs: Item[] = [
  { key: "quickLinks.teachingJobs", to: "/tutor-jobs" },
  { key: "quickLinks.onlineTeaching", to: "/tutor-jobs", search: { mode: "online" } },
  { key: "quickLinks.homeTeaching", to: "/tutor-jobs", search: { mode: "home" } },
  { key: "quickLinks.assignmentJobs", to: "/tutor-jobs", search: { jobType: "assignment" } },
];

function Group({
  title,
  icon: Icon,
  items,
  accent,
  t,
}: {
  title: string;
  icon: typeof GraduationCap;
  items: Item[];
  accent: "primary" | "accent";
  t: (key: string) => string;
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
        {items.map((it) => (
          <div key={`${it.to}-${it.search ? JSON.stringify(it.search) : "all"}`}>
            <Link
              to={it.to as string}
              search={it.search}
              className="group relative flex items-center justify-between overflow-hidden rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground/90 shadow-sm transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md"
            >
              <span className="flex items-center gap-2.5">
                <span className={`h-1.5 w-1.5 rounded-full ${dot} opacity-70 transition-opacity group-hover:opacity-100`} />
                {t(it.key)}
              </span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-all group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              <span className={`pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r ${ring}`} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export function QuickLinks() {
  const { t } = useTranslation("common");
  return (
    <section className="py-16 sm:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2 md:gap-14">
          <Group title={t("quickLinks.teachersGroup")} icon={GraduationCap} items={teachers} accent="primary" t={t} />
          <Group title={t("quickLinks.jobsGroup")} icon={Briefcase} items={jobs} accent="primary" t={t} />
        </div>
      </div>
    </section>
  );
}
