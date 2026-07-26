"use client";

import { Link, useRouterState } from "@/lib/navigation";
import { useTranslation } from "react-i18next";
import { useApp } from "@/hooks/use-app";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Horizontal student/parent nav (Dashboard · My Posts · Find Tutors · … · Post Requirement). */
export function LearnerSubNav() {
  const { t } = useTranslation("common");
  const { role } = useApp();
  const path = useRouterState({ select: (s) => s.location.pathname });

  if (role !== "student" && role !== "parent") return null;

  const dashboardTo = `/${role}` as const;

  const links = [
    { to: dashboardTo, label: t("nav.dashboard", "Dashboard"), match: (p: string) => p === dashboardTo },
    {
      to: "/my-posts",
      label: t("nav.myPosts", "My Posts"),
      match: (p: string) => p.startsWith("/my-posts"),
    },
    {
      to: "/tutors",
      label: t("nav.findTutors", "Find Tutors"),
      match: (p: string) => p.startsWith("/tutors"),
    },
    {
      to: "/reviews",
      label: t("nav.reviews", "Reviews"),
      match: (p: string) => p.startsWith("/reviews"),
    },
  ] as const;

  return (
    <div className="border-b bg-card/80">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-1" aria-label={t("nav.learnerNav", "Account menu")}>
          {links.map((item) => {
            const active = item.match(path);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "relative pb-1 text-sm font-semibold transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
                {active ? (
                  <span className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-primary" />
                ) : null}
              </Link>
            );
          })}
        </nav>
        <Button asChild size="sm" variant="gradient" className="shrink-0">
          <Link to="/post-requirement">{t("nav.postRequirement", "Post Requirement")}</Link>
        </Button>
      </div>
    </div>
  );
}
