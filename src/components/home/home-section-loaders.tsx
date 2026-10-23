/** Min-height shells for `next/dynamic` home sections — aligned with `HomeBelowFoldPlaceholders`. */
export function GeoStripLoader({ dual = true }: { dual?: boolean }) {
  return (
    <div className="container mx-auto px-4 py-6 sm:py-8" aria-hidden>
      <div className="mb-4 min-h-7" />
      <div className={`grid gap-4 ${dual ? "md:grid-cols-2" : ""}`}>
        <div className="aspect-[16/7] w-full rounded-2xl border border-transparent" />
        {dual ? <div className="aspect-[16/7] w-full rounded-2xl border border-transparent" /> : null}
      </div>
    </div>
  );
}

export function QuickLinksLoader() {
  return <div className="min-h-[220px]" aria-hidden />;
}

export function LevelUpLoader() {
  return <div className="min-h-[280px]" aria-hidden />;
}

export function TrustStatsLoader() {
  return <div className="min-h-[120px]" aria-hidden />;
}

export function TrendingLoader() {
  return <div className="min-h-[680px]" aria-hidden />;
}

export function TopTutorsLoader() {
  return <div className="min-h-[640px]" aria-hidden />;
}

export function PopularSubjectsLoader() {
  return <div className="min-h-[240px]" aria-hidden />;
}

export function FaqLoader() {
  return <div className="min-h-[360px]" aria-hidden />;
}

export function CtaLoader() {
  return <div className="min-h-[200px]" aria-hidden />;
}
