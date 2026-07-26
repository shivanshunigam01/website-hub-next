"use client";

import { Link } from "@/lib/navigation";
import { Calendar, Clock, MapPin, Monitor, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/hooks/use-currency";
import type { Workshop } from "@/types/workshop";
import { AppImage } from "@/components/AppImage";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function WorkshopCard({ workshop }: { workshop: Workshop }) {
  const { formatLocalizedPrice } = useCurrency();
  const full = workshop.spotsLeft <= 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:border-primary/30 hover:shadow-md">
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        {workshop.imageUrl ? (
          <AppImage
            src={workshop.imageUrl}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-indigo-500/10 text-primary">
            <Calendar className="h-10 w-10 opacity-60" />
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="bg-background/90 backdrop-blur">
            {workshop.category}
          </Badge>
          <Badge variant="secondary" className="bg-background/90 backdrop-blur capitalize">
            {workshop.mode}
          </Badge>
        </div>
        {workshop.isFree ? (
          <Badge className="absolute right-3 top-3 bg-emerald-600 hover:bg-emerald-600">Free</Badge>
        ) : (
          <Badge className="absolute right-3 top-3 bg-primary">{formatLocalizedPrice(workshop.price, workshop.currency || "USD")}</Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-bold leading-snug line-clamp-2">{workshop.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">by {workshop.teacherName}</p>
        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{workshop.description}</p>

        <ul className="mt-4 space-y-1.5 text-xs text-muted-foreground">
          <li className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-primary" />
            {formatDate(workshop.workshopDate)}
          </li>
          <li className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 shrink-0 text-primary" />
            {workshop.startTime} – {workshop.endTime}
          </li>
          <li className="flex items-center gap-2">
            {workshop.mode === "online" ? (
              <Monitor className="h-3.5 w-3.5 shrink-0 text-primary" />
            ) : (
              <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
            )}
            {workshop.mode === "online" ? "Online session" : workshop.location || "In person"}
          </li>
          <li className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 shrink-0 text-primary" />
            {full ? "Full" : `${workshop.spotsLeft} spots left`} · {workshop.enrolledStudents}/
            {workshop.maxStudents} enrolled
          </li>
        </ul>

        <Button asChild size="lg" variant="gradient" className="mt-5 w-full">
          <Link to="/workshops/$id" params={{ id: workshop.id }}>
            View & register
          </Link>
        </Button>
      </div>
    </article>
  );
}

export function WorkshopStatusBadge({ status }: { status: Workshop["status"] }) {
  const map = {
    pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
    approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
    inactive: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  } as const;
  return (
    <Badge variant="outline" className={`capitalize border-0 ${map[status]}`}>
      {status}
    </Badge>
  );
}
