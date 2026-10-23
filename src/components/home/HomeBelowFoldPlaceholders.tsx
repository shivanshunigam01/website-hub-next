/** Shown while the home client bundle loads — heights match `views/index.tsx` section shells. */
export function HomeBelowFoldPlaceholders() {
  return (
    <div className="w-full max-w-full" aria-hidden data-home-placeholders>
      <div className="min-h-[min(42vw,320px)] md:min-h-[280px]" />
      <div className="min-h-[220px]" />
      <div className="min-h-[280px]" />
      <div className="min-h-[120px]" />
      <div className="min-h-[min(42vw,320px)] md:min-h-[280px]" />
      <div className="min-h-[680px]" />
      <div className="min-h-[640px]" />
      <div className="min-h-[240px]" />
      <div className="min-h-[360px]" />
      <div className="min-h-[200px]" />
    </div>
  );
}
