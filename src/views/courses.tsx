"use client";

import { useMemo, useState } from "react";
import { Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CourseCard } from "@/components/cards/CourseCard";
import { CoursesMentorHero } from "@/components/courses/CoursesMentorHero";
import { CATEGORIES } from "@/data/mock";
import { useCourses } from "@/hooks/use-catalog";
import { useCurrency } from "@/hooks/use-currency";
import { canonicalUrl } from "@/lib/site-config";

const LEVELS = ["Beginner", "Intermediate", "Advanced"];

function FP({ cat, setCat, level, setLevel, price, setPrice, rating, setRating, cert, setCert, priceSymbol }: any) {
  return (
    <div className="space-y-6">
      <div>
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Category</Label>
        <div className="mt-2 space-y-2">
          {CATEGORIES.slice(1).map((c) => (
            <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox checked={cat === c.name} onCheckedChange={(v) => setCat(v ? c.name : "")} />{c.name}
            </label>
          ))}
        </div>
      </div>
      <div>
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Level</Label>
        <div className="mt-2 space-y-2">
          {LEVELS.map((l) => (
            <label key={l} className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox checked={level === l} onCheckedChange={(v) => setLevel(v ? l : "")} />{l}
            </label>
          ))}
        </div>
      </div>
      <div>
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Max price · {priceSymbol}{price[0]}</Label>
        <Slider value={price} onValueChange={setPrice} max={100} step={5} className="mt-3" />
      </div>
      <div>
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Min rating · {rating[0]}★</Label>
        <Slider value={rating} onValueChange={setRating} min={3} max={5} step={0.1} className="mt-3" />
      </div>
      <label className="flex items-center gap-2 text-sm"><Checkbox checked={cert} onCheckedChange={(c) => setCert(!!c)} />With certificate</label>
    </div>
  );
}

function CoursesPage() {
  const { data: courses = [], isLoading } = useCourses();
  const { symbol: priceSymbol } = useCurrency();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [level, setLevel] = useState("");
  const [price, setPrice] = useState([100]);
  const [rating, setRating] = useState([3]);
  const [cert, setCert] = useState(false);

  const list = useMemo(
    () =>
      courses.filter((c) => {
        if (q && !`${c.title} ${c.instructor}`.toLowerCase().includes(q.toLowerCase())) return false;
        if (cat && c.category !== cat) return false;
        if (level && c.level !== level) return false;
        if (c.price > price[0]) return false;
        if (c.rating < rating[0]) return false;
        if (cert && !c.certificate) return false;
        return true;
      }),
    [courses, q, cat, level, price, rating, cert],
  );

  const fp = { cat, setCat, level, setLevel, price, setPrice, rating, setRating, cert, setCert, priceSymbol };

  return (
    <>
      <CoursesMentorHero />
      <section className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-display font-extrabold text-3xl md:text-4xl">Courses</h1>
        <p className="text-muted-foreground mt-2">{list.length} courses match your filters</p>
      </div>
      <div className="grid lg:grid-cols-[260px_1fr] gap-8">
        <aside className="hidden lg:block bg-card border rounded-2xl p-5 h-fit sticky top-24">
          <h3 className="font-display font-semibold mb-4">Filters</h3>
          <FP {...fp} />
        </aside>
        <div>
          <div className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search courses…" className="pl-10" />
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden"><Filter className="h-4 w-4 mr-2" />Filters</Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
                <div className="mt-4"><FP {...fp} /></div>
              </SheetContent>
            </Sheet>
          </div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {isLoading && <div className="col-span-full text-center py-20 text-muted-foreground">Loading courses…</div>}
            {!isLoading && list.map((c) => <CourseCard key={c.id} course={c} />)}
          </div>
          {!isLoading && list.length === 0 && <div className="text-center py-20 text-muted-foreground">No courses match your filters.</div>}
        </div>
      </div>
    </section>
    </>
  );
}

export default CoursesPage;
