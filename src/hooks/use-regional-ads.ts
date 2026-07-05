import { useCallback, useEffect, useState } from "react";
import { getApiBaseUrl } from "@/lib/api";
import { mapApiBanner, type ApiBanner } from "@/lib/regional-ad-map";
import type { RegionalAd } from "@/hooks/use-admin-store";
import { useLocationContext } from "@/hooks/use-user-location";

type ActiveResponse = { items: ApiBanner[] };

let cachedAds: RegionalAd[] | null = null;
let cacheKey = "";
let cacheTs = 0;
const CACHE_MS = 60_000;

function buildGeoQuery(location: { country?: string; city?: string; countryCode?: string } | null) {
  if (!location) return "";
  const params = new URLSearchParams();
  if (location.country) params.set("country", location.country);
  if (location.city) params.set("city", location.city);
  if (location.countryCode) params.set("countryCode", location.countryCode);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

async function fetchActiveBanners(geoQuery: string): Promise<RegionalAd[]> {
  const res = await fetch(`${getApiBaseUrl()}/banners/active${geoQuery}`);
  const json = (await res.json()) as { success: boolean; data?: ActiveResponse };
  if (!res.ok || !json.success || !json.data?.items) return [];
  return json.data.items.map(mapApiBanner);
}

/**
 * Loads geo-targeted banners/ads from the CMS API.
 * Passes detected country/city to the backend for server-side geo filtering.
 */
export function useRegionalAds() {
  const { location, isLoading, hasLocationAccess } = useLocationContext();
  const geoQuery = buildGeoQuery(hasLocationAccess ? location : null);
  const [regionalAds, setRegionalAds] = useState<RegionalAd[]>(cachedAds ?? []);
  const [loading, setLoading] = useState(!cachedAds || cacheKey !== geoQuery);
  const locationLoading = isLoading;

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const mapped = await fetchActiveBanners(geoQuery);
      cachedAds = mapped;
      cacheKey = geoQuery;
      cacheTs = Date.now();
      setRegionalAds(mapped);
    } catch {
      if (!cachedAds) setRegionalAds([]);
    } finally {
      setLoading(false);
    }
  }, [geoQuery]);

  useEffect(() => {
    if (locationLoading) return;
    if (cachedAds && cacheKey === geoQuery && Date.now() - cacheTs < CACHE_MS) {
      setRegionalAds(cachedAds);
      setLoading(false);
      return;
    }
    refresh();
  }, [locationLoading, geoQuery, refresh]);

  return { regionalAds, loading: loading || locationLoading, refresh };
}

/** Invalidate public banner cache after admin CMS edits. */
export function invalidateRegionalAdsCache() {
  cachedAds = null;
  cacheKey = "";
  cacheTs = 0;
}
