/** Shared grid geometry for GeoContentStrip (loading, 1-ad, 2-ad) — avoids desktop column CLS. */
export function geoAdGridClass(limit: number) {
  return limit > 1 ? "grid gap-4 md:grid-cols-2" : "grid gap-4";
}

export function geoAdItemClass(limit: number, itemCount: number) {
  if (limit > 1 && itemCount === 1) {
    return "md:col-span-2";
  }
  return undefined;
}
