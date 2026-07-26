"use client";

import { useEffect, useMemo, useState } from "react";
import { Link } from "@/lib/navigation";
import { Building2, ArrowRight, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocationContext } from "@/hooks/use-user-location";
import { useAdminStore, type Accommodation } from "@/hooks/use-admin-store";
import { filterAccommodationsByUserCountry } from "@/lib/accommodation-location";
import { ONBOARDING_POPUPS_ENABLED } from "@/lib/popup-sequence";
import { AppImage } from "@/components/AppImage";

const LS_KEY = "tp.accommodationPrompted";

function matchByLocation(list: Accommodation[], city?: string, country?: string, countryCode?: string) {
  const scoped = filterAccommodationsByUserCountry(
    list,
    country || countryCode ? { country: country ?? "", countryCode: countryCode ?? "", city: city ?? "" } : null,
    !!(country || countryCode),
  );
  if (!city && !country && !countryCode) return [] as Accommodation[];

  const c = (city ?? "").toLowerCase().trim();
  const cityMatches = scoped.filter((a) => c && a.city.toLowerCase() === c);
  if (cityMatches.length) return cityMatches;
  return scoped;
}

export function AccommodationLocationDialog() {
  if (!ONBOARDING_POPUPS_ENABLED) return null;

  const { location, isLoading } = useLocationContext();
  const { accommodations } = useAdminStore();
  const [open, setOpen] = useState(false);

  const matches = useMemo(
    () => matchByLocation(accommodations, location?.city, location?.country, location?.countryCode),
    [accommodations, location?.city, location?.country, location?.countryCode],
  );

  useEffect(() => {
    if (isLoading || !location) return;
    if (typeof window === "undefined") return;
    if (localStorage.getItem(LS_KEY)) return;
    if (matches.length === 0) return;
    // Small delay so it doesn't compete with the language dialog
    const t = setTimeout(() => setOpen(true), 3500);
    return () => clearTimeout(t);
  }, [isLoading, location, matches.length]);

  const dismiss = () => {
    if (typeof window !== "undefined") localStorage.setItem(LS_KEY, "1");
    setOpen(false);
  };

  const preview = matches.slice(0, 2);

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : dismiss())}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        <div className="relative bg-gradient-primary p-6 text-primary-foreground">
          <button
            onClick={dismiss}
            className="absolute right-3 top-3 rounded-full p-1.5 text-primary-foreground/80 transition hover:bg-white/10 hover:text-primary-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <Badge className="mb-2 border-white/25 bg-white/15 text-primary-foreground hover:bg-white/15">
            <Building2 className="me-1 h-3 w-3" />
            Student stays nearby
          </Badge>
          <DialogHeader className="space-y-1.5 text-left">
            <DialogTitle className="font-display text-2xl font-bold text-primary-foreground">
              Need a place to stay?
            </DialogTitle>
            <DialogDescription className="text-sm text-primary-foreground/85">
              We have <strong className="text-primary-foreground">{matches.length}</strong>{" "}
              verified PG / hostel options available for students in your area.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-3 p-6">
          {preview.map((a) => (
            <div key={a.id} className="flex items-center gap-3 rounded-xl border bg-card p-3">
              <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                {a.imageUrl ? (
                  <AppImage
                    src={a.imageUrl}
                    alt={a.name}
                    fill
                    sizes="80px"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="truncate font-semibold text-sm">{a.name}</h4>
                  <Badge variant="secondary" className="shrink-0 text-[10px]">
                    {a.type}
                  </Badge>
                </div>
                <p className="truncate text-xs text-muted-foreground">{a.address}</p>
                <p className="mt-0.5 text-xs font-semibold text-primary">
                  {a.currency} {a.pricePerMonth.toLocaleString()}/mo
                </p>
              </div>
            </div>
          ))}

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={dismiss}>
              Not now
            </Button>
            <Button asChild onClick={dismiss}>
              <Link
                to="/accommodation"
                search={{ city: location?.city ?? undefined } as never}
              >
                View all stays
                <ArrowRight className="ms-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
