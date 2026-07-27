"use client";

import { Link, useRouterState } from "@/lib/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Moon, Sun, Menu, X, Bell, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/hooks/use-app";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { BrandLogo } from "@/components/BrandLogo";
import { UserAvatar } from "@/components/UserAvatar";
import { CATEGORIES } from "@/data/mock";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const NAV_PATHS = [
  { to: "/courses", key: "nav.courses" },
  { to: "/workshops", key: "nav.workshops" },
  { to: "/tutors", key: "nav.tutors" },
  { to: "/marketplace", key: "nav.marketplace" },
  { to: "/accommodation", key: "nav.accommodation" },
] as const;

const INLINE_NAV_PATHS = NAV_PATHS.filter((n) => n.to !== "/courses" && n.to !== "/tutors");

/** Full inline nav needs ~1280px; below that use the hamburger to avoid overlap. */
const DESKTOP_NAV_MQ = "(min-width: 1280px)";

function navItemClass(active: boolean) {
  return cn(
    "inline-flex h-9 shrink-0 items-center gap-1 whitespace-nowrap rounded-lg px-2 text-xs font-medium transition-colors lg:px-2.5 xl:text-sm",
    active ? "text-primary" : "text-muted-foreground hover:text-foreground",
  );
}

function TutorsNavDropdown({
  path,
  navClass,
  label,
}: {
  path: string;
  navClass: (active: boolean) => string;
  label: string;
}) {
  const { t } = useTranslation("common");
  const active = path.startsWith("/tutors") || path.startsWith("/post-requirement");
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={navClass(active)}>
          {label} <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuItem asChild>
          <Link to="/post-requirement">{t("nav.requestTutor")}</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/tutors">{t("nav.allTutors")}</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/tutors" search={{ mode: "online", online: "true" } as any}>
            {t("nav.onlineTutors")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/tutors" search={{ mode: "in-person", online: "false" } as any}>
            {t("nav.homeTutors")}
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DesktopNavLinks({
  path,
  navLabel,
  tc,
  t,
}: {
  path: string;
  navLabel: (key: string, fallback: string) => string;
  tc: (name: string) => string;
  t: (key: string) => string;
}) {
  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className={navItemClass(path.startsWith("/courses"))}>
            {t("nav.categories")} <ChevronDown className="h-3.5 w-3.5 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-52">
          <DropdownMenuLabel>{t("nav.browseTopics")}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {CATEGORIES.slice(1).map((c) => (
            <DropdownMenuItem key={c.id} asChild>
              <Link to="/courses" search={{ category: c.name } as any}>
                {tc(c.name)}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className={navItemClass(path.startsWith("/tutor-jobs"))}>
            {t("nav.tutorJobs")} <ChevronDown className="h-3.5 w-3.5 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuItem asChild>
            <Link to="/tutor-jobs">{t("nav.allTutorJobs")}</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/tutor-jobs" search={{ mode: "online" }}>
              {t("nav.onlineTutorJobs")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/tutor-jobs" search={{ mode: "home" }}>
              {t("nav.homeTutorJobs")}
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Link to="/courses" className={navItemClass(path.startsWith("/courses"))}>
        {navLabel("nav.courses", "Courses")}
      </Link>

      <TutorsNavDropdown path={path} navClass={navItemClass} label={navLabel("nav.tutors", "Tutors")} />

      {INLINE_NAV_PATHS.map((n) => (
        <Link key={n.to} to={n.to} className={navItemClass(path.startsWith(n.to))}>
          {navLabel(n.key, n.to.slice(1).replace(/^./, (c) => c.toUpperCase()))}
        </Link>
      ))}

      <Link to="/post-requirement" className={navItemClass(path.startsWith("/post-requirement"))}>
        {navLabel("nav.postJob", "Post a job")}
      </Link>
    </>
  );
}

export function Header() {
  const { theme, toggleTheme, role, user, logout } = useApp();
  const { t } = useTranslation("common");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  const tc = (categoryName: string) => {
    const key = `category.${categoryName}`;
    const translated = t(key);
    return translated === key ? categoryName : translated;
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("overflow-hidden", mobileOpen);
    return () => {
      document.documentElement.classList.remove("overflow-hidden");
    };
  }, [mobileOpen]);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_NAV_MQ);
    const closeIfDesktop = () => {
      if (mq.matches) setMobileOpen(false);
    };
    mq.addEventListener("change", closeIfDesktop);
    return () => mq.removeEventListener("change", closeIfDesktop);
  }, []);

  const navLabel = (key: string, fallback: string) => {
    const translated = t(key);
    return translated === key ? fallback : translated;
  };

  return (
    <>
      <div
        className="notranslate border-b bg-muted/50 px-4 py-2 text-center text-xs text-muted-foreground sm:text-sm"
        suppressHydrationWarning
        translate="no"
      >
        {mounted ? (
          <>
            {t("promo.sale")}{" "}
            <Link to="/courses" className="font-medium text-primary underline-offset-2 hover:underline">
              {t("promo.browse")}
            </Link>
          </>
        ) : (
          <span className="opacity-0">·</span>
        )}
      </div>

      <header
        className="notranslate sticky top-0 z-50 w-full max-w-[100vw] overflow-x-clip border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
        translate="no"
      >
        <div className="container mx-auto flex h-16 min-h-16 items-center gap-2 px-4 sm:px-6">
          <Link to="/" className="relative z-10 flex shrink-0 items-center" aria-label={t("nav.ariaHome")}>
            <BrandLogo size="header" priority />
          </Link>

          <nav
            className="hidden min-w-0 flex-1 items-center justify-center overflow-hidden xl:flex"
            aria-label={t("nav.ariaMain")}
          >
            <div className="flex max-w-full flex-nowrap items-center justify-center gap-0.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <DesktopNavLinks path={path} navLabel={navLabel} tc={tc} t={t} />
            </div>
          </nav>

          <div className="relative z-10 ms-auto flex shrink-0 flex-nowrap items-center justify-end gap-0.5 bg-background/95 ps-1 sm:gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0"
              aria-label={t("nav.toggleTheme")}
              onClick={toggleTheme}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <LanguageSwitcher />
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="relative hidden h-9 w-9 shrink-0 md:flex"
              aria-label={t("nav.notifications")}
            >
              <Link to={role && user ? "/messages" : "/login"}>
                <Bell className="h-4 w-4" />
                {role && user ? (
                  <span className="absolute end-2 top-2 h-1.5 w-1.5 rounded-full bg-destructive" />
                ) : null}
              </Link>
            </Button>

            {role && user ? (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="hidden h-9 shrink-0 gap-2 sm:flex">
                    <UserAvatar name={user.name} avatarUrl={user.avatarUrl} size="sm" className="h-6 w-6" />
                    <span className="max-w-[4rem] truncate capitalize text-xs">{role}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel className="flex items-center gap-2 py-2">
                    <UserAvatar name={user.name} avatarUrl={user.avatarUrl} size="sm" />
                    <span className="truncate">{user.name}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={`/${role}` as any}>{t("nav.dashboard")}</Link>
                  </DropdownMenuItem>
                  {(role === "student" || role === "parent") && (
                    <DropdownMenuItem asChild>
                      <Link to="/my-posts">{t("nav.myPosts")}</Link>
                    </DropdownMenuItem>
                  )}
                  {(role === "student" || role === "teacher" || role === "parent") && (
                    <DropdownMenuItem asChild>
                      <Link to="/profile">{t("nav.editProfile")}</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/messages">{t("nav.messages")}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/support">{t("nav.support")}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>{t("nav.logout")}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="hidden h-9 shrink-0 px-2 text-xs xl:inline-flex">
                  <Link to="/login">{t("nav.login")}</Link>
                </Button>
                <Button asChild size="sm" variant="gradient" className="hidden h-9 shrink-0 px-2.5 text-xs xl:inline-flex">
                  <Link to="/role-select">{t("nav.signup")}</Link>
                </Button>
              </>
            )}

            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0 xl:hidden"
              aria-label={mobileOpen ? t("nav.closeMenu") : t("nav.openMenu")}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileOpen && (
          <div className="max-h-[min(70vh,calc(100dvh-3.5rem))] overflow-y-auto border-t bg-background xl:hidden">
            <div className="container mx-auto space-y-1 px-4 py-4">
              <p className="px-3 pt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("nav.categories")}
              </p>
              {CATEGORIES.slice(1, 6).map((c) => (
                <Link
                  key={c.id}
                  to="/courses"
                  search={{ category: c.name } as any}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  {tc(c.name)}
                </Link>
              ))}

              <div className="space-y-1 border-t pt-2">
                <p className="px-3 pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("nav.tutorJobs")}
                </p>
                <Link
                  to="/tutor-jobs"
                  onClick={() => setMobileOpen(false)}
                  className={`block ${navItemClass(path.startsWith("/tutor-jobs") && !path.includes("mode"))}`}
                >
                  {t("nav.allTutorJobs")}
                </Link>
                <Link
                  to="/tutor-jobs"
                  search={{ mode: "online" }}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  {t("nav.onlineTutorJobs")}
                </Link>
                <Link
                  to="/tutor-jobs"
                  search={{ mode: "home" }}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  {t("nav.homeTutorJobs")}
                </Link>
              </div>

              {NAV_PATHS.map((n) =>
                n.to === "/tutors" ? (
                  <div key={n.to} className="space-y-1 border-t pt-2">
                    <p className="px-3 pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {t("nav.tutors")}
                    </p>
                    <Link
                      to="/post-requirement"
                      onClick={() => setMobileOpen(false)}
                      className={`block ${navItemClass(path.startsWith("/post-requirement"))}`}
                    >
                      {t("nav.requestTutor")}
                    </Link>
                    <Link
                      to="/tutors"
                      onClick={() => setMobileOpen(false)}
                      className={`block ${navItemClass(path.startsWith("/tutors"))}`}
                    >
                      {t("nav.allTutors")}
                    </Link>
                    <Link
                      to="/tutors"
                      search={{ mode: "online", online: "true" } as any}
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      {t("nav.onlineTutors")}
                    </Link>
                    <Link
                      to="/tutors"
                      search={{ mode: "in-person", online: "false" } as any}
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      {t("nav.homeTutors")}
                    </Link>
                  </div>
                ) : (
                  <Link
                    key={n.to}
                    to={n.to}
                    onClick={() => setMobileOpen(false)}
                    className={`block ${navItemClass(path.startsWith(n.to))}`}
                  >
                    {t(n.key)}
                  </Link>
                ),
              )}

              <Link
                to="/post-requirement"
                onClick={() => setMobileOpen(false)}
                className={`block border-t pt-2 ${navItemClass(path.startsWith("/post-requirement"))}`}
              >
                {t("nav.postJob")}
              </Link>

              {(role === "student" || role === "parent") && (
                <Link
                  to="/my-posts"
                  onClick={() => setMobileOpen(false)}
                  className={`block ${navItemClass(path.startsWith("/my-posts"))}`}
                >
                  {t("nav.myPosts")}
                </Link>
              )}

              {role && user ? (
                <div className="space-y-1 border-t pt-2">
                  <Link
                    to={`/${role}` as any}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    {t("nav.dashboard")}
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    {t("nav.editProfile")}
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      logout();
                    }}
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-destructive hover:bg-accent"
                  >
                    {t("nav.logout")}
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    {t("nav.login")}
                  </Link>
                  <Link
                    to="/role-select"
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-primary hover:bg-accent"
                  >
                    {t("nav.signup")}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
