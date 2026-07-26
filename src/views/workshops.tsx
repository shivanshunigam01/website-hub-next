"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { canonicalUrl } from "@/lib/site-config";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WorkshopCard } from "@/components/workshops/WorkshopCard";
import { fetchPublicWorkshops } from "@/services/workshops-api";
import { formatApiErrorMessage } from "@/lib/api";
import type { Workshop } from "@/types/workshop";
import { toast } from "sonner";

function WorkshopsPage() {
  const { t } = useTranslation("common");
  const [items, setItems] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [mode, setMode] = useState("all");
  const [pricing, setPricing] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPublicWorkshops({
        category: category === "all" ? undefined : category,
        mode: mode === "all" ? undefined : mode,
        pricing: pricing === "all" ? undefined : (pricing as "free" | "paid"),
        limit: 50,
      });
      setItems(data.items);
    } catch (e) {
      toast.error(formatApiErrorMessage(e, t("workshops.loadError", "Failed to load workshops")));
    } finally {
      setLoading(false);
    }
  }, [category, mode, pricing, t]);

  useEffect(() => {
    load();
  }, [load]);

  const categories = useMemo(
    () => Array.from(new Set(items.map((w) => w.category))).sort(),
    [items],
  );

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter(
      (w) =>
        w.title.toLowerCase().includes(term) ||
        w.teacherName.toLowerCase().includes(term) ||
        w.description.toLowerCase().includes(term),
    );
  }, [items, q]);

  return (
    <div className="container mx-auto px-4 py-10 md:py-14">
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Calendar className="h-3.5 w-3.5 text-primary" />
          {t("workshops.badge")}
        </span>
        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {t("workshops.title")}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {t("workshops.subtitle")}
        </p>
      </div>

      <div className="mx-auto mt-10 flex max-w-4xl flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-0 flex-1 sm:min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("workshops.searchPlaceholder")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder={t("workshops.category")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("workshops.allCategories")}</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={mode} onValueChange={setMode}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder={t("workshops.mode")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("workshops.allModes")}</SelectItem>
            <SelectItem value="online">{t("workshops.online")}</SelectItem>
            <SelectItem value="offline">{t("workshops.offline")}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={pricing} onValueChange={setPricing}>
          <SelectTrigger className="w-full sm:w-[130px]">
            <SelectValue placeholder={t("workshops.price")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("workshops.all")}</SelectItem>
            <SelectItem value="free">{t("workshops.free")}</SelectItem>
            <SelectItem value="paid">{t("workshops.paid")}</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={load}>
          {t("workshops.refresh")}
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          {t("workshops.loading")}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mx-auto mt-12 max-w-md rounded-2xl border border-dashed bg-muted/20 p-10 text-center">
          <Calendar className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <h2 className="mt-3 font-semibold">{t("workshops.emptyTitle")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("workshops.emptyDesc")}
          </p>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((w) => (
            <WorkshopCard key={w.id} workshop={w} />
          ))}
        </div>
      )}
    </div>
  );
}

export default WorkshopsPage;
