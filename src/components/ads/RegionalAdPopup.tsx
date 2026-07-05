"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useRouterState } from "@/lib/navigation";
import { Sparkles, X, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRegionalAds } from "@/hooks/use-regional-ads";
import { useLocationContext } from "@/hooks/use-user-location";
import { pickRegionalPopupAd } from "@/lib/regional-ads";
import { REGIONAL_POPUP_DELAY_MS, REGIONAL_POPUP_ENABLED } from "@/lib/popup-sequence";

/** Once per browser session — popup shows again on the next visit. */
const SEEN_KEY = "tp_regional_popup_seen";

function hasSeenPopupThisSession(): boolean {
  if (typeof window === "undefined") return true;
  return sessionStorage.getItem(SEEN_KEY) === "1";
}

function markPopupSeenThisSession() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SEEN_KEY, "1");
}

export function RegionalAdPopup() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { regionalAds, loading: adsLoading } = useRegionalAds();
  const { location, isLoading: locationLoading, hasLocationAccess } = useLocationContext();
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setSeen(hasSeenPopupThisSession());
    setMounted(true);
  }, []);

  const isPublic = !path.startsWith("/admin");

  const ad = useMemo(
    () =>
      locationLoading || adsLoading
        ? null
        : pickRegionalPopupAd(regionalAds, hasLocationAccess ? location : null, i18n.language),
    [regionalAds, location, locationLoading, adsLoading, hasLocationAccess, i18n.language],
  );

  const shouldShow =
    REGIONAL_POPUP_ENABLED &&
    mounted &&
    !seen &&
    isPublic &&
    !locationLoading &&
    !adsLoading &&
    hasLocationAccess &&
    !!location &&
    !!ad;

  useEffect(() => {
    if (!shouldShow) {
      setOpen(false);
      return;
    }
    const t = window.setTimeout(() => setOpen(true), REGIONAL_POPUP_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [shouldShow]);

  if (!REGIONAL_POPUP_ENABLED || (seen && !open)) return null;
  if (!ad && !open) return null;

  const handleClose = () => {
    markPopupSeenThisSession();
    setSeen(true);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-md gap-0 overflow-hidden border-white/10 p-0 shadow-2xl sm:max-w-lg"
      >
        <div
          className="relative px-6 pb-5 pt-8 text-primary-foreground"
          style={{ background: "var(--gradient-primary)" }}
        >
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-fuchsia-400/20 blur-3xl" />

          <button
            type="button"
            onClick={handleClose}
            className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-white transition-colors hover:bg-white/20"
            aria-label="Close"
          >
            <X className="h-4 w-4 stroke-[2.5]" />
          </button>

          <Badge className="relative mb-3 border-white/25 bg-white/15 text-white hover:bg-white/15">
            <Sparkles className="mr-1 h-3 w-3" />
            Featured offer
          </Badge>

          <DialogHeader className="relative space-y-2 text-left">
            <DialogTitle className="font-display text-2xl font-bold leading-tight text-white">
              {ad?.title}
            </DialogTitle>
            {ad?.description ? (
              <DialogDescription className="text-sm text-white/85">{ad.description}</DialogDescription>
            ) : null}
          </DialogHeader>

          {ad?.mediaType === "video" && ad.videoUrl ? (
            <video
              src={ad.videoUrl}
              autoPlay
              muted
              loop
              playsInline
              className="relative mt-4 max-h-36 w-full rounded-xl border border-white/20 object-cover"
            />
          ) : ad?.imageUrl ? (
            <img
              src={ad.imageUrl}
              alt=""
              className="relative mt-4 max-h-36 w-full rounded-xl border border-white/20 object-cover"
            />
          ) : null}
        </div>

        <div className="space-y-3 bg-card px-6 py-5">
          {ad?.ctaLink && (
            <Button
              asChild
              size="lg"
              variant="gradient"
              className="w-full shadow-lg"
              onClick={handleClose}
            >
              <Link to={ad.ctaLink as "/"}>
                {ad.ctaText || "Learn more"}
                <ArrowRight className="ms-1 h-4 w-4" />
              </Link>
            </Button>
          )}

          <button
            type="button"
            onClick={handleClose}
            className="w-full text-center text-xs text-muted-foreground transition hover:text-foreground"
          >
            Maybe later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
