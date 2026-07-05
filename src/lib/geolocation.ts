export type {
  UserLocation,
  GeoapifyReverseResponse,
  LocationDetectResult,
  LocationDebugInfo,
  LocationPermission,
} from "@/lib/geolocation-types";

import type { LocationDetectResult } from "@/lib/geolocation-types";
import { detectBrowserRegion } from "@/lib/browser-region";
import { getApiBaseUrl } from "@/lib/api";
import {
  exposeLocationDebug,
  logLocation,
  logLocationApi,
} from "@/lib/location-debug";

type GeoApiEnvelope = {
  success: boolean;
  data?: {
    location?: {
      country?: string;
      countryCode?: string;
      city?: string;
      state?: string;
      formatted?: string;
    } | null;
    geoapify?: unknown;
  };
};

async function fetchBackendReverse(lat: number, lon: number): Promise<LocationDetectResult | null> {
  const params = new URLSearchParams({ lat: String(lat), lon: String(lon) });
  const url = `${getApiBaseUrl()}/geo/reverse?${params}`;
  const started = performance.now();
  try {
    const res = await fetch(url, { cache: "no-store" });
    const ms = Math.round(performance.now() - started);
    const json = (await res.json()) as GeoApiEnvelope;
    logLocationApi("Reverse geocode (backend)", url, res.status, json, ms);

    if (!res.ok || !json.success || !json.data?.location?.country) return null;

    const loc = json.data.location;
    return {
      location: {
        country: loc.country!,
        countryCode: (loc.countryCode ?? "").toUpperCase(),
        city: loc.city ?? "",
        state: loc.state,
        formatted: loc.formatted,
      },
      geoapify: (json.data.geoapify as LocationDetectResult["geoapify"]) ?? null,
      ipSource: "gps",
    };
  } catch (err) {
    logLocation("Reverse geocode (backend) failed", err);
    return null;
  }
}

/** Browser public IP only — no Geoapify / server connection IP. */
export async function geolocateByIp(): Promise<LocationDetectResult> {
  const region = await detectBrowserRegion();

  if (!region) {
    return { location: null, geoapify: null, ipSource: "none" };
  }

  return {
    location: region.location,
    geoapify: null,
    browserIp: region.ip || null,
    currency: region.currency,
    phoneDialCode: region.phoneDialCode,
    defaultLanguage: region.defaultLanguage,
    ipSource: "browser",
    debug: {
      source: "ip",
      clientIp: region.ip,
      geoapifyEndpoint: region.source,
      geoapifyHttpStatus: 200,
      resolvedCity: region.location.city,
      resolvedCountry: region.location.country,
      durationMs: 0,
      note: `Browser IP via ${region.source} — currency ${region.currency}, ISD ${region.phoneDialCode}`,
    },
  };
}

export async function reverseGeocode(lat: number, lon: number): Promise<LocationDetectResult> {
  const fromBackend = await fetchBackendReverse(lat, lon);
  if (fromBackend?.location) {
    exposeLocationDebug(fromBackend);
    return fromBackend;
  }

  return { location: null, geoapify: null, ipSource: "gps" };
}

export function requestBrowserPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    logLocation("GPS → requesting browser permission…", null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        logLocation("GPS → success", {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracyMeters: pos.coords.accuracy,
        });
        resolve(pos);
      },
      (err) => {
        logLocation("GPS → denied or failed", { code: err.code, message: err.message });
        reject(err);
      },
      {
        enableHighAccuracy: true,
        timeout: 15_000,
        maximumAge: 60_000,
      },
    );
  });
}

/**
 * IP-based geolocation for visitor-facing UI — browser public IP only (VPN-friendly).
 */
export async function detectUserLocation(): Promise<LocationDetectResult> {
  logLocation("detect → start (browser IP only)", null);
  const fromIp = await geolocateByIp();
  if (fromIp.location) {
    logLocation("detect → using browser IP region", fromIp.location);
    exposeLocationDebug(fromIp);
    return { ...fromIp, permission: "granted" };
  }
  logLocation("detect → browser IP region unavailable", null);
  return { location: null, geoapify: null, permission: "unknown", ipSource: "none" };
}

/** Browser GPS — only call when the user explicitly opts in (triggers a permission prompt). */
export async function detectUserLocationByGps(): Promise<LocationDetectResult> {
  logLocation("detect (GPS) → start", null);

  if (typeof navigator === "undefined" || !navigator.geolocation) {
    logLocation("detect (GPS) → geolocation unsupported", null);
    return { location: null, geoapify: null, permission: "unsupported" };
  }

  try {
    const pos = await requestBrowserPosition();
    const fromGps = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
    if (fromGps.location) {
      logLocation("detect (GPS) → resolved", fromGps.location);
      exposeLocationDebug(fromGps);
      return { ...fromGps, permission: "granted" };
    }
    return { location: null, geoapify: fromGps.geoapify, permission: "unknown" };
  } catch (err: unknown) {
    const code = typeof err === "object" && err !== null && "code" in err ? Number((err as { code: number }).code) : 0;
    const permission: LocationDetectResult["permission"] = code === 1 ? "denied" : "unknown";
    logLocation("detect (GPS) → unavailable", { code, permission });
    return { location: null, geoapify: null, permission };
  }
}

/** IP lookup for analytics/admin only. */
export async function detectUserLocationByIp(): Promise<LocationDetectResult> {
  const fromIp = await geolocateByIp();
  exposeLocationDebug(fromIp);
  return fromIp;
}

export function getCountryCodeFromGeoapify(
  data?: import("@/lib/geolocation-types").GeoapifyReverseResponse | null,
): string | undefined {
  const code = data?.features?.[0]?.properties?.country_code;
  return code ? code.toLowerCase() : undefined;
}
