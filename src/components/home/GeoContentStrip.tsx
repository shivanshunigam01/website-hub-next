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

function resolveAdImage(ad: RegionalAd) {
  return ad.approvedImageUrl || ad.imageUrl || undefined;
}

function Media({ ad }: { ad: RegionalAd }) {
  if (ad.mediaType === "video" && ad.videoUrl) {
    return (
      <DeferredBackgroundVideo
        src={ad.videoUrl}
        poster={resolveAdImage(ad) || geoBannerFallback}
        desktopDelayMs={1200}
        mobileDelayMs={3500}
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

function AdCard({ ad }: { ad: RegionalAd }) {
  const { t } = useTranslation("common");
  return (
    <article className="group relative isolate overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:shadow-lg">
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
  /** Max ads to render. */
  limit?: number;
  /** Show a small heading row above the strip. */
  withHeading?: boolean;
  className?: string;
};

export function GeoContentStrip({
  placement = "hero-strip",
  limit = 2,
  withHeading = true,
  className,
}: Props) {
  const { location, isLoading, hasLocationAccess } = useLocationContext();
  const { regionalAds } = useRegionalAds();
  const { t, i18n } = useTranslation("common");

  const ads = useMemo(
    () =>
      isLoading || !hasLocationAccess
        ? []
        : filterRegionalAds(regionalAds, location, { placement, language: i18n.language }),
    [regionalAds, location, isLoading, hasLocationAccess, placement, i18n.language],
  );

  if (!hasLocationAccess || isLoading) return null;
  if (!ads.length) return null;
  const shown = ads.slice(0, limit);

  return (
    <section className={`container mx-auto px-4 py-6 sm:py-8 ${className ?? ""}`}>
      {withHeading && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe2 className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">{t("geo.featuredForYou")}</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {t("geo.language")} <span className="font-medium uppercase text-foreground">{i18n.language}</span>
          </span>
        </div>
      )}
      <div className={`grid gap-4 ${shown.length > 1 ? "md:grid-cols-2" : ""}`}>
        {shown.map((ad) => (
          <AdCard key={ad.id} ad={ad} />
        ))}
      </div>
    </section>
  );
}
