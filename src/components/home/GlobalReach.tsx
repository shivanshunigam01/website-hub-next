"use client";

import { useTranslation } from "react-i18next";
import { Globe2, Users, MapPin } from "lucide-react";
import Image from "next/image";
import worldMap from "@/assets/global-presence-map.png";

// Approx normalized coords on the uploaded map image (x%, y%)
const HOTSPOTS: { left: string; top: string; key: string; defaultLabel: string }[] = [
  { left: "72%", top: "52%", key: "india", defaultLabel: "India" },
  { left: "23%", top: "42%", key: "usa", defaultLabel: "USA" },
  { left: "49%", top: "32%", key: "uk", defaultLabel: "UK" },
  { left: "83%", top: "48%", key: "china", defaultLabel: "China" },
  { left: "88%", top: "52%", key: "japan", defaultLabel: "Japan" },
  { left: "62%", top: "48%", key: "uae", defaultLabel: "UAE" },
  { left: "55%", top: "75%", key: "southAfrica", defaultLabel: "South Africa" },
  { left: "32%", top: "82%", key: "brazil", defaultLabel: "Brazil" },
  { left: "86%", top: "82%", key: "australia", defaultLabel: "Australia" },
  { left: "52%", top: "38%", key: "germany", defaultLabel: "Germany" },
];

export function GlobalReach() {
  const { t } = useTranslation("common");

  const activeTeachersLabel = t("globalReach.activeTeachers", "Active Teachers");
  const stats = [
    {
      icon: Users,
      label: activeTeachersLabel,
      value: "200,000+",
    },
    {
      icon: Globe2,
      label: t("stats.countries"),
      value: "178",
    },
    {
      icon: MapPin,
      label: t("globalReach.statCities", "Cities Served"),
      value: "3,400+",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-hero py-16 md:py-24 dark:bg-background">
      {/* Soft theme glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, oklch(0.55 0.18 258 / 0.18), transparent 60%)",
        }}
        aria-hidden
      />

      <div className="container relative mx-auto px-4">
        <div className="mb-10 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border bg-background/80 px-3 py-1 text-xs font-medium text-primary backdrop-blur">
            <Globe2 className="h-3.5 w-3.5" />
            {t("globalReach.badge", "Global Network")}
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
            <span className="text-gradient-primary">200,000+</span>{" "}
            {activeTeachersLabel}
            <span className="mt-1 block text-xl font-medium text-muted-foreground sm:text-2xl md:text-3xl">
              {t("globalReach.from", "from")}{" "}
              <span className="font-bold text-foreground">
                {t("globalReach.countriesCount", "{{count}} Countries", { count: 178 })}
              </span>
            </span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
            {t(
              "globalReach.subtitle",
              "A worldwide community of verified educators, ready to teach in your language and time zone.",
            )}
          </p>
        </div>

        {/* Map */}
        <div className="relative mx-auto max-w-6xl">
          <div className="relative">
            <Image
              src={worldMap}
              alt={t(
                "globalReach.mapAlt",
                "World map showing TeacherPoint global presence across 178 countries",
              )}
              width={1200}
              height={620}
              sizes="(max-width: 768px) 100vw, 1152px"
              className="h-auto w-full select-none dark:invert dark:hue-rotate-180 dark:brightness-95"
              placeholder="blur"
              draggable={false}
            />

            {/* Pulsing markers on top of the map */}
            <div className="pointer-events-none absolute inset-0">
              {HOTSPOTS.map((h) => {
                const label = t(`globalReach.country.${h.key}`, h.defaultLabel);
                return (
                  <div
                    key={h.key}
                    className="group absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: h.left, top: h.top }}
                  >
                    <span className="relative block h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_10px_2px_oklch(0.55_0.18_258/0.6)]">
                      <span className="absolute inset-0 animate-ping rounded-full bg-primary/60" />
                    </span>
                    <span className="absolute left-1/2 top-4 hidden -translate-x-1/2 whitespace-nowrap rounded-md border bg-background px-2 py-0.5 text-[10px] font-medium text-foreground shadow-soft group-hover:block">
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Stat strip */}
        <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-xl border bg-card/80 px-4 py-3 shadow-soft backdrop-blur"
            >
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="font-display text-lg font-bold">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
