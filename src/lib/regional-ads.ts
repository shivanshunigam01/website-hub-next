import type { RegionalAd, RegionalAdPlacement } from "@/hooks/use-admin-store";
import type { UserLocation } from "@/lib/geolocation";

const norm = (s: string) => s.trim().toLowerCase();

export function adMatchesLocation(ad: RegionalAd, location: UserLocation | null): boolean {
  if (!ad.active) return false;
  if (ad.targetType === "global") return true;
  if (!location) return false;

  const target = norm(ad.targetValue);

  if (ad.targetType === "country") {
    const country = norm(location.country);
    const code = norm(location.countryCode);
    return (
      country === target ||
      code === target ||
      country.includes(target) ||
      target.includes(country) ||
      target === code ||
      (target.length === 2 && code === target)
    );
  }

  if (ad.targetType === "city") {
    const city = norm(location.city);
    return city === target || city.includes(target) || target.includes(city);
  }

  return false;
}

export function adMatchesLanguage(ad: RegionalAd, language: string | undefined): boolean {
  const lang = (ad.language ?? "").trim().toLowerCase();
  if (!lang) return true;
  return !!language && norm(language).startsWith(lang);
}

const targetPriority = (ad: RegionalAd) =>
  ad.targetType === "city" ? 3 : ad.targetType === "country" ? 2 : 1;

function sortAds(a: RegionalAd, b: RegionalAd) {
  const byTarget = targetPriority(b) - targetPriority(a);
  if (byTarget !== 0) return byTarget;
  const byPriority = (b.priority ?? 0) - (a.priority ?? 0);
  if (byPriority !== 0) return byPriority;
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

export function filterRegionalAds(
  ads: RegionalAd[],
  location: UserLocation | null,
  options: { placement?: RegionalAdPlacement; language?: string; dismissed?: Set<string> } = {},
) {
  const { placement, language, dismissed } = options;
  return ads
    .filter((ad) => adMatchesLocation(ad, location))
    .filter((ad) => adMatchesLanguage(ad, language))
    .filter((ad) => (placement ? (ad.placement ?? "popup") === placement : true))
    .filter((ad) => !(dismissed?.has(ad.id) ?? false))
    .sort(sortAds);
}

export function pickRegionalAd(
  ads: RegionalAd[],
  location: UserLocation | null,
  dismissed: Set<string>,
  language?: string,
) {
  return filterRegionalAds(ads, location, { placement: "popup", language, dismissed })[0] ?? null;
}

/**
 * Location popup — only admin items with placement "popup" targeted to the visitor's country or city.
 * Worldwide/global popup items are excluded so the modal only appears for configured regions.
 */
export function pickRegionalPopupAd(
  ads: RegionalAd[],
  location: UserLocation | null,
  language?: string,
) {
  return (
    filterRegionalAds(ads, location, { placement: "popup", language })
      .filter((ad) => ad.targetType === "country" || ad.targetType === "city")[0] ?? null
  );
}
