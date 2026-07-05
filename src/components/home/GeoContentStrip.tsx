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

function Media({ ad }: { ad: RegionalAd }) {
  if (ad.mediaType === "video" && ad.videoUrl) {
    return (
      <video
        src={ad.videoUrl}
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        className="absolute inset-0 h-full w-full object-cover"
        aria-hidden
      />
    );
  }
  if (ad.mediaType === "image" && ad.imageUrl) {
    return (
      <AppImage
        src={ad.imageUrl}
        alt=""
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    );
  }
  return (
    <div
      className="absolute inset-0"
      style={{ background: "var(--gradient-primary, linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent))))" }}
    />
  );
}

function AdCard({ ad }: { ad: RegionalAd }) {
  return (
    <article className="group relative isolate overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:shadow-lg">
      <div className="relative aspect-[16/7] w-full">
        <Media ad={ad} />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/50 to-slate-900/10 dark:from-slate-950/90 dark:via-slate-900/60" />
        <div className="relative z-10 flex h-full max-w-full flex-col justify-center gap-2 p-4 sm:max-w-[62%] sm:p-7">
          <Badge variant="secondary" className="w-fit border-primary/20 bg-primary/10 text-primary">
            <Sparkles className="me-1 h-3 w-3" /> Featured
          </Badge>
          <h3 className="font-display text-lg font-bold sm:text-2xl">{ad.title}</h3>
          <p className="line-clamp-2 text-sm text-muted-foreground sm:text-base">{ad.description}</p>
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
  const { i18n } = useTranslation();

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
            <span className="font-semibold text-foreground">Featured for you</span>
          </div>
          <span className="text-xs text-muted-foreground">
            Language: <span className="font-medium uppercase text-foreground">{i18n.language}</span>
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
