"use client";

import { MapPin, Star, Wifi, Utensils, ShieldCheck, BedDouble } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Accommodation } from "@/hooks/use-admin-store";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80&auto=format&fit=crop";

const TYPE_COLORS: Record<string, string> = {
  PG: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  Hostel: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  Apartment: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  "Shared Room": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
};

export function AccommodationCard({
  accommodation,
  onInquire,
}: {
  accommodation: Accommodation;
  onInquire?: (a: Accommodation) => void;
}) {
  const a = accommodation;
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border bg-card transition hover:-translate-y-1 hover:shadow-card">
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <img
          src={a.imageUrl || FALLBACK_IMG}
          alt={a.name}
          loading="lazy"
          className="h-full w-full object-cover transition group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex gap-1.5">
          <Badge className={TYPE_COLORS[a.type] ?? "bg-secondary"}>{a.type}</Badge>
          {!a.available && (
            <Badge variant="secondary" className="bg-destructive/90 text-destructive-foreground">
              Full
            </Badge>
          )}
        </div>
        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-background/95 px-2 py-0.5 text-xs font-semibold backdrop-blur">
          <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
          {a.rating.toFixed(1)}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-base font-bold leading-tight line-clamp-1">{a.name}</h3>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span className="line-clamp-1">
            {a.address ? `${a.address}, ` : ""}
            {a.city}
          </span>
        </div>

        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{a.description}</p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {a.amenities.slice(0, 4).map((am) => (
            <span
              key={am}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
            >
              {am === "Wi-Fi" && <Wifi className="h-2.5 w-2.5" />}
              {am.toLowerCase().includes("meal") && <Utensils className="h-2.5 w-2.5" />}
              {am.toLowerCase().includes("security") && <ShieldCheck className="h-2.5 w-2.5" />}
              {am.toLowerCase().includes("room") && <BedDouble className="h-2.5 w-2.5" />}
              {am}
            </span>
          ))}
          {a.amenities.length > 4 && (
            <span className="text-[10px] text-muted-foreground">+{a.amenities.length - 4}</span>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <div>
            <div className="font-display text-lg font-bold text-foreground">
              {a.currency} {a.pricePerMonth.toLocaleString()}
              <span className="ml-1 text-xs font-normal text-muted-foreground">/mo</span>
            </div>
            <div className="text-[10px] capitalize text-muted-foreground">For {a.gender}</div>
          </div>
          <Button size="sm" onClick={() => onInquire?.(a)}>
            Enquire
          </Button>
        </div>
      </div>
    </article>
  );
}
