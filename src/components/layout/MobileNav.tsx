"use client";

import { Link, useRouterState } from "@/lib/navigation";
import { Home, Users, User, Briefcase, LayoutDashboard } from "lucide-react";
import { useApp } from "@/hooks/use-app";
import { useTranslation } from "react-i18next";

export function MobileNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { role } = useApp();
  const { t } = useTranslation("common");
  const profileTo = role ? ("/profile" as const) : "/login";
  const dashboardTo = role ? (`/${role}` as const) : "/login";

  const items = [
    { to: "/", label: t("nav.home"), icon: Home },
    { to: "/tutor-jobs", label: t("nav.jobs"), icon: Briefcase },
    { to: "/tutors", label: t("nav.tutors"), icon: Users },
    {
      to: dashboardTo,
      label: t("nav.dashboard"),
      icon: LayoutDashboard,
    },
  ] as const;

  const isDashboard =
    path.startsWith("/admin") ||
    path.startsWith("/student") ||
    path.startsWith("/teacher") ||
    path.startsWith("/parent") ||
    path.startsWith("/lms");

  if (isDashboard) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t bg-background safe-bottom lg:hidden"
      aria-label="Mobile navigation"
    >
      <div className="grid grid-cols-5">
        {items.map((i) => {
          const active = path === i.to || (i.to !== "/" && path.startsWith(i.to));
          return (
            <Link
              key={`${i.to}-${i.label}`}
              to={i.to}
              className={`flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 py-2 text-[11px] font-medium sm:text-xs ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <i.icon className="h-5 w-5" strokeWidth={active ? 2.25 : 2} />
              <span className="max-w-full truncate">{i.label}</span>
            </Link>
          );
        })}
        <Link
          to={profileTo}
          className={`flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 py-2 text-[11px] font-medium sm:text-xs ${
            path === profileTo || (profileTo !== "/login" && path.startsWith(profileTo))
              ? "text-primary"
              : "text-muted-foreground"
          }`}
        >
          <User className="h-5 w-5" />
          <span className="max-w-full truncate">{role ? t("nav.account") : t("nav.login")}</span>
        </Link>
      </div>
    </nav>
  );
}
