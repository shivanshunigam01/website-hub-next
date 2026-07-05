"use client";

import { Link } from "@/lib/navigation";
import { Star, MapPin, ShieldCheck, Crown, Wifi } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/hooks/use-currency";
import type { Tutor } from "@/types/catalog";
import { tutorImage } from "@/data/images";
import { AppImage } from "@/components/AppImage";

export function TutorCard({ tutor }: { tutor: Tutor }) {
  const { formatLocalizedPrice } = useCurrency();
  const img = tutor.avatarUrl || tutor.image || tutorImage(tutor.id);

  if (!tutor.id) {
    return (
      <article className="flex h-full flex-col rounded-2xl border bg-card opacity-60">
        <div className="p-4 text-sm text-muted-foreground">Profile unavailable</div>
      </article>
    );
  }

  return (
    <Link
      to="/tutors/$id"
      params={{ id: tutor.id }}
      className="group block h-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-2xl"
    >
      <article className="flex h-full flex-col rounded-2xl border bg-card transition-all hover:border-primary/30 hover:shadow-md">
        <div
          className="relative z-0 h-24 shrink-0 overflow-hidden rounded-t-2xl"
          style={{ background: tutor.gradient }}
        >
          {tutor.topTen && (
            <Badge className="absolute right-3 top-3 z-20 bg-amber-400 text-amber-950 hover:bg-amber-400">
              <Crown className="mr-1 h-3 w-3" />
              Top 10%
            </Badge>
          )}
        </div>
        <div className="relative z-10 -mt-12 px-4">
          <div className="relative h-24 w-24 overflow-hidden rounded-2xl border-4 border-card bg-card shadow-md">
            <AppImage
              src={img}
              alt={tutor.name}
              fill
              sizes="96px"
              className="object-top"
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="flex items-center gap-1 truncate font-display font-bold">
                {tutor.name}
                {tutor.verified && <ShieldCheck className="h-4 w-4 shrink-0 text-sky" />}
              </h3>
              <p className="text-xs text-muted-foreground">
                {tutor.subject} · {tutor.experience}y exp
              </p>
            </div>
            <div className="shrink-0 text-right">
              <div className="font-display font-bold">
                {formatLocalizedPrice(tutor.price, tutor.currency)}
                <span className="text-xs font-normal text-muted-foreground">/hr</span>
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
              <span className="font-semibold text-foreground">{tutor.rating}</span>
              ({tutor.reviews})
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {tutor.location.split(",")[0]}
            </span>
            {tutor.online && (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <Wifi className="h-3 w-3" />
                Online
              </span>
            )}
          </div>

          <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{tutor.bio}</p>
        </div>
      </article>
    </Link>
  );
}
