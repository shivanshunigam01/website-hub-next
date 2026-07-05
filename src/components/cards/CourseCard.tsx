"use client";

import { Link } from "@/lib/navigation";
import { Star, Clock, Users, BookOpen, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/hooks/use-currency";
import type { Course } from "@/types/catalog";
import { courseImage } from "@/data/images";

export function CourseCard({ course }: { course: Course }) {
  const { formatLocalizedPrice } = useCurrency();
  const img = (course as any).image || courseImage(course.id);
  return (
    <Link to="/courses/$id" params={{ id: course.id }} className="group block">
      <article className="h-full overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md">
        <div
          className={`aspect-video relative overflow-hidden ${course.gradient.startsWith("from-") ? `bg-gradient-to-br ${course.gradient}` : ""}`}
          style={course.gradient.startsWith("from-") ? undefined : { background: course.gradient }}
        >
          <img src={img} alt={course.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
          <div className="absolute top-3 left-3 flex gap-2">
            {course.bestseller && <Badge className="bg-amber-400 text-amber-950 hover:bg-amber-400">Bestseller</Badge>}
            {course.certificate && <Badge className="bg-white/95 text-slate-900 hover:bg-white"><Award className="h-3 w-3 mr-1" />Cert</Badge>}
          </div>
          <div className="absolute bottom-3 left-3 right-3 text-white">
            <div className="text-xs opacity-90 uppercase tracking-wide">{course.category}</div>
            <div className="font-display font-bold text-lg leading-tight line-clamp-2">{course.title}</div>
          </div>
        </div>
        <div className="p-4">
          <p className="text-xs text-muted-foreground">By {course.instructor}</p>
          <div className="flex items-center gap-1 mt-2">
            <span className="text-amber-500 font-semibold text-sm">{course.rating}</span>
            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            <span className="text-xs text-muted-foreground">({course.reviews.toLocaleString()})</span>
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{course.duration}</span>
            <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{course.lessons}</span>
            <span className="flex items-center gap-1"><Users className="h-3 w-3" />{(course.students / 1000).toFixed(1)}k</span>
          </div>
          <div className="flex items-end gap-2 mt-3">
            <span className="font-display font-bold text-lg">{formatLocalizedPrice(course.price, course.currency || "USD")}</span>
            <span className="text-xs text-muted-foreground line-through">{formatLocalizedPrice(course.oldPrice, course.currency || "USD")}</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold ml-auto">{course.level}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
