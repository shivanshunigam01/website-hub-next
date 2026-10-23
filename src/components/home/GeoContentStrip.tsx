"use client";

import { useMemo } from "react";
import { Link } from "@/lib/navigation";
import { useTranslation } from "react-i18next";
import { Globe2, ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { RegionalAd, RegionalAdPlacement } from "@/hooks/use-admin-store";
import { useRegionalAds } from "@/hooks/use-regional-ads";
import { useLocationContext } from "@/hooks/use-user-location";
import { filterRegionalAds } from "@/lib/regional-ads";
import { AppImage } from "@/components/AppImage";
import { DeferredBackgroundVideo } from "@/components/DeferredBackgroundVideo";
import geoBannerFallback from "@/assets/career-banner.jpg";
import geoStudentsFallback from "@/assets/hero-illustration.jpg";
import { geoAdGridClass, geoAdItemClass } from "@/components/home/geo-content-grid";

function resolveAdImage(ad: RegionalAd) {
  return ad.approvedImageUrl || ad.imageUrl || undefined;
}

function Media({ ad }: { ad: RegionalAd }) {
  if (ad.mediaType === "video" && ad.videoUrl) {
    return (
      <DeferredBackgroundVideo
        src={ad.videoUrl}
        poster={resolveAdImage(ad) || geoBannerFallback}
        desktopDelayMs={4000}
        mobileDelayMs={8000}
      />
    );
  }

  const imageSrc =
    resolveAdImage(ad) ||
    (ad.placement === "hero-strip" ? geoStudentsFallback : geoBannerFallback);

  return (
    <AppImage
      src={imageSrc}
      alt=""
      fill
      sizes="(max-width: 768px) 100vw, 50vw"
      className="object-cover object-[72%_center] sm:object-right"
      fallbackSrc={typeof geoStudentsFallback === "string" ? geoStudentsFallback : geoStudentsFallback.src}
    />
  );
}

function AdCard({ ad, className }: { ad: RegionalAd; className?: string }) {
  const { t } = useTranslation("common");
  return (
    <article
      className={`group relative isolate overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:shadow-lg ${className ?? ""}`}
    >
      <div className="relative aspect-[16/7] w-full">
        <Media ad={ad} />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/65 to-slate-900/15 dark:from-slate-950/95 dark:via-slate-900/70" />
        <div className="relative z-10 flex h-full max-w-full flex-col justify-center gap-2 p-4 sm:max-w-[58%] sm:p-7">
          <Badge variant="secondary" className="w-fit border-white/30 bg-white/15 text-white">
            <Sparkles className="me-1 h-3 w-3" /> {t("geo.featured")}
          </Badge>
          <h3 className="font-display text-lg font-bold text-white sm:text-2xl">{ad.title}</h3>
          <p className="line-clamp-2 text-sm text-white/85 sm:text-base">{ad.description}</p>
          <div className="pt-1">
            <Button asChild size="sm" className="shadow">
              <Link to={ad.ctaLink as "/"}>
                {ad.ctaText}
                <ArrowRight className="ms-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

type Props = {
  placement?: RegionalAdPlacement;
  limit?: number;
  withHeading?: boolean;
  className?: string;
};

function GeoStripSkeleton({
  limit,
  withHeading,
  shellClass,
  pulse,
}: {
  limit: number;
  withHeading: boolean;
  shellClass: string;
  pulse?: boolean;
}) {
  const gridClass = geoAdGridClass(limit);
  return (
    <div className={shellClass} aria-hidden>
      {withHeading ? <div className="mb-4 min-h-7" /> : null}
      <div className={gridClass}>
        {Array.from({ length: limit }).map((_, i) => (
          <div
            key={i}
            className={`aspect-[16/7] w-full rounded-2xl border ${pulse ? "animate-pulse bg-muted/40" : "border-transparent"}`}
          />
        ))}
      </div>
    </div>
  );
}

export function GeoContentStrip({
  placement = "hero-strip",
  limit = 2,
  withHeading = true,
  className,
}: Props) {
  const { location, isLoading, hasLocationAccess, status } = useLocationContext();
  const { regionalAds, loading: adsLoading } = useRegionalAds();
  const { t, i18n } = useTranslation("common");

  const shellClass = `container mx-auto px-4 py-6 sm:py-8 ${className ?? ""}`;
  const gridClass = geoAdGridClass(limit);

  const ads = useMemo(
    () =>
      isLoading || adsLoading || !hasLocationAccess
        ? []
        : filterRegionalAds(regionalAds, location, { placement, language: i18n.language }),
    [regionalAds, location, isLoading, adsLoading, hasLocationAccess, placement, i18n.language],
  );

  const geoPending = status === "idle" || isLoading;
  const geoUnavailable = status === "error" && !hasLocationAccess;

  if (geoUnavailable) {
    return null;
  }

  if (geoPending || adsLoading) {
    return <GeoStripSkeleton limit={limit} withHeading={withHeading} shellClass={shellClass} pulse />;
  }

  const shown = ads.slice(0, limit);
  if (!shown.length) {
    return null;
  }

  const itemSpan = geoAdItemClass(limit, shown.length);

  return (
    <section className={shellClass}>
      {withHeading && (
        <div className="mb-4 flex min-h-7 flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe2 className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">{t("geo.featuredForYou")}</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {t("geo.language")}{" "}
            <span className="font-medium uppercase text-foreground">{i18n.language}</span>
          </span>
        </div>
      )}
      <div className={gridClass}>
        {shown.map((ad) => (
          <AdCard key={ad.id} ad={ad} className={itemSpan} />
        ))}
      </div>
    </section>
  );
}
