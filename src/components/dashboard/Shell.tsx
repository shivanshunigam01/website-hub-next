"use client";

import { Link, useNavigate, useRouterState } from "@/lib/navigation";
import { Children, isValidElement, useEffect, useState, type ReactNode } from "react";
import { Moon, Sun, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/hooks/use-app";
import { BrandLogo } from "@/components/BrandLogo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/UserAvatar";

/** In-dashboard section anchor (sidebar item). Always stays inside the role module. */
export interface NavItem {
  /** Unique anchor id within the dashboard page (matches a <section id=…>) */
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

type RoleAccent = {
  label: string;
  gradient: string;        // CSS gradient for header strip / active bar
  ring: string;            // tailwind ring color class for active item
  chip: string;            // tailwind classes for role chip
  glow: string;            // soft background tint
};

const ROLE_ACCENTS: Record<string, RoleAccent> = {
  student: {
    label: "Student",
    gradient: "linear-gradient(135deg,#6366f1,#3b82f6 55%,#06b6d4)",
    ring: "ring-indigo-400/50",
    chip: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20",
    glow: "from-indigo-500/10 via-transparent to-transparent",
  },
  teacher: {
    label: "Teacher",
    gradient: "linear-gradient(135deg,#10b981,#0ea5e9 55%,#6366f1)",
    ring: "ring-emerald-400/50",
    chip: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20",
    glow: "from-emerald-500/10 via-transparent to-transparent",
  },
  parent: {
    label: "Parent",
    gradient: "linear-gradient(135deg,#f59e0b,#ef4444 55%,#ec4899)",
    ring: "ring-amber-400/50",
    chip: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
    glow: "from-amber-500/10 via-transparent to-transparent",
  },
  admin: {
    label: "Admin",
    gradient: "linear-gradient(135deg,#8b5cf6,#ec4899 55%,#f43f5e)",
    ring: "ring-fuchsia-400/50",
    chip: "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-300 border-fuchsia-500/20",
    glow: "from-fuchsia-500/10 via-transparent to-transparent",
  },
};

const DEFAULT_ACCENT = ROLE_ACCENTS.student;

export function DashboardShell({
  items,
  title,
  children,
  activeSection,
  onSectionChange,
}: {
  items: NavItem[];
  title: string;
  children: ReactNode;
  /** Optional controlled active section. Defaults to URL hash. */
  activeSection?: string;
  onSectionChange?: (id: string) => void;
}) {
  const { user, role, theme, toggleTheme, logout } = useApp();
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const accent = (role && ROLE_ACCENTS[role]) || DEFAULT_ACCENT;

  // Track active section by hash (uncontrolled mode).
  const [hash, setHash] = useState<string>("");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sync = () => setHash(window.location.hash.replace(/^#/, ""));
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [path]);

  const current = activeSection ?? hash ?? items[0]?.id ?? "";
  const activeId = current || items[0]?.id || "";

  const handleSelect = (id: string) => {
    if (onSectionChange) {
      onSectionChange(id);
    } else if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${id}`);
      setHash(id);
    }
  };

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  // Show only the active DashboardSection (panel-switch behaviour, like an admin panel).
  // Non-section children (e.g. dialogs, banners) always render.
  const childArray = Children.toArray(children);
  const sectionChildren = childArray.filter(
    (c) => isValidElement(c) && typeof (c.props as { id?: unknown }).id === "string",
  );
  const otherChildren = childArray.filter(
    (c) => !isValidElement(c) || typeof (c.props as { id?: unknown }).id !== "string",
  );
  const visibleSection =
    sectionChildren.find(
      (c) => isValidElement(c) && (c.props as { id?: string }).id === activeId,
    ) ?? sectionChildren[0];

  return (
    <SidebarProvider className="flex h-[100dvh] w-full flex-col overflow-hidden">

      {/* Header */}
      <header className="relative z-50 flex h-16 shrink-0 items-center gap-3 border-b bg-background px-3 sm:px-4">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[3px]"
          style={{ background: accent.gradient }}
          aria-hidden
        />
        <SidebarTrigger className="shrink-0" />
        <Link
          to={`/${role ?? ""}` as "/"}
          className="flex shrink-0 items-center"
          aria-label="Dashboard home"
        >
          <BrandLogo size="header" />
        </Link>
        <div className="hidden items-center gap-2 sm:flex">
          <span className="text-sm font-semibold">{title}</span>
          <Badge
            variant="outline"
            className={cn("rounded-full px-2 py-0 text-[10px] uppercase tracking-wide", accent.chip)}
          >
            {accent.label}
          </Badge>
        </div>

        <div className="ms-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("nav.toggleTheme")}
            onClick={toggleTheme}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <LanguageSwitcher />
          {user && (
            <div className="hidden items-center gap-2 md:flex">
              <UserAvatar
                name={user.name}
                avatarUrl={user.avatarUrl}
                size="sm"
                className="ring-2 ring-background shadow"
              />
              <span className="max-w-[8rem] truncate text-sm font-medium">{user.name}</span>
            </div>
          )}
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">{t("nav.logout")}</span>
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Sidebar */}
        <Sidebar
          collapsible="icon"
          className="!top-16 !bottom-0 !h-[calc(100dvh-4rem)] border-r"
        >
          <SidebarContent className="py-3">
            <SidebarGroup>
              <SidebarGroupLabel className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                {accent.label} menu
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="px-1.5">
                  {items.map((i) => {
                    const isActive = activeId === i.id;
                    return (
                      <SidebarMenuItem key={i.id}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          className={cn(
                            "group/menu-item relative h-10 rounded-lg transition-all",
                            isActive &&
                              "bg-gradient-to-r from-primary/10 to-transparent font-semibold text-foreground shadow-sm",
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => handleSelect(i.id)}
                            className="flex w-full items-center gap-2"
                          >
                            <span
                              className={cn(
                                "absolute inset-y-1 left-0 w-1 rounded-r-full transition-opacity",
                                isActive ? "opacity-100" : "opacity-0",
                              )}
                              style={{ background: accent.gradient }}
                              aria-hidden
                            />
                            <i.icon
                              className={cn(
                                "h-4 w-4 shrink-0",
                                isActive ? "text-primary" : "text-muted-foreground",
                              )}
                            />
                            <span className="truncate">{i.label}</span>
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="min-h-0 min-w-0 flex-1 overflow-hidden">
          <div className="relative h-full overflow-y-auto">
            {/* Role glow */}
            <div
              className={cn(
                "pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b",
                accent.glow,
              )}
              aria-hidden
            />
            <div className="relative p-4 md:p-6">
              {visibleSection}
              {otherChildren}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

/** Convenience wrapper for an in-dashboard section. */
export function DashboardSection({
  id,
  title,
  description,
  action,
  children,
  className,
}: {
  id: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("scroll-mt-20 mb-8", className)}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight">{title}</h2>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
  change,
  icon: Icon,
  color = "from-sky-400 to-blue-600",
}: any) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border bg-card p-5 transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium text-muted-foreground">{label}</div>
          <div className="mt-1 font-display text-2xl font-extrabold tracking-tight">{value}</div>
          {change && <div className="mt-1 text-xs font-medium text-emerald-600">{change}</div>}
        </div>
        <div
          className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${color} text-white shadow-sm`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
