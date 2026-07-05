import type { UserLocation } from "@/lib/geolocation-types";
import { getCurrencyForCountryCode } from "@/lib/currency-from-country";
import {
  DEFAULT_PHONE_COUNTRY_CODE,
  getPhoneCodeForCountryCode,
  normalizeCountryCode,
} from "@/lib/phone-from-country";
import { suggestLanguageForLocation } from "@/lib/google-translate";
import { logLocation } from "@/lib/location-debug";

export type BrowserRegion = {
  ip: string;
  location: UserLocation;
  currency: string;
  phoneDialCode: string;
  defaultLanguage: string;
  source: "ipwho.is" | "ipapi.co" | "locale";
};

type IpWhoResponse = {
  success?: boolean;
  ip?: string;
  country?: string;
  country_code?: string;
  region?: string;
  city?: string;
  calling_code?: string;
};

type IpApiCoResponse = {
  ip?: string;
  country_code?: string;
  country_name?: string;
  city?: string;
  region?: string;
  currency?: string;
  country_calling_code?: string;
  error?: boolean;
  reason?: string;
};

function normalizeDialCode(raw?: string | null, countryCode?: string): string {
  const trimmed = String(raw ?? "").trim();
  if (trimmed) {
    const digits = trimmed.replace(/^\+/, "");
    if (digits) return `+${digits}`;
  }
  return getPhoneCodeForCountryCode(countryCode) || DEFAULT_PHONE_COUNTRY_CODE;
}

function buildRegion(
  ip: string,
  countryCode: string,
  country: string,
  city: string,
  state: string | undefined,
  currencyHint: string | undefined,
  dialHint: string | undefined,
  source: BrowserRegion["source"],
): BrowserRegion {
  const code = normalizeCountryCode(countryCode);
  const location: UserLocation = {
    country: country || code,
    countryCode: code,
    city: city || "",
    state,
    formatted: [city, state, country].filter(Boolean).join(", "),
  };

  const currency =
    currencyHint && currencyHint.length === 3
      ? currencyHint.toUpperCase()
      : getCurrencyForCountryCode(code);

  return {
    ip,
    location,
    currency,
    phoneDialCode: normalizeDialCode(dialHint, code),
    defaultLanguage: suggestLanguageForLocation(location),
    source,
  };
}

async function fetchFromIpWho(): Promise<BrowserRegion | null> {
  const res = await fetch("https://ipwho.is/", {
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return null;

  const data = (await res.json()) as IpWhoResponse;
  if (!data.success || !data.country_code) return null;

  return buildRegion(
    data.ip ?? "",
    data.country_code,
    data.country ?? data.country_code,
    data.city ?? "",
    data.region,
    undefined,
    data.calling_code,
    "ipwho.is",
  );
}

async function fetchFromIpApiCo(): Promise<BrowserRegion | null> {
  const res = await fetch("https://ipapi.co/json/", {
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return null;

  const data = (await res.json()) as IpApiCoResponse;
  if (data.error || !data.country_code) return null;

  return buildRegion(
    data.ip ?? "",
    data.country_code,
    data.country_name ?? data.country_code,
    data.city ?? "",
    data.region,
    data.currency,
    data.country_calling_code,
    "ipapi.co",
  );
}

function fallbackFromLocale(): BrowserRegion | null {
  if (typeof navigator === "undefined") return null;

  const langs = [navigator.language, ...(navigator.languages || [])];
  for (const lang of langs) {
    const part = lang.split("-")[1];
    if (!part || part.length !== 2) continue;
    const code = part.toUpperCase();
    return buildRegion("", code, code, "", undefined, undefined, undefined, "locale");
  }

  return buildRegion("", "IN", "India", "", undefined, "INR", "+91", "locale");
}

/**
 * Detect country, city, currency, phone ISD, and default language from the
 * browser's public IP only — same network path as Google (VPN-friendly).
 * Does not call Geoapify or the backend geo API.
 */
export async function detectBrowserRegion(): Promise<BrowserRegion | null> {
  logLocation("browser-region → start (browser IP only)", null);

  for (const provider of [fetchFromIpWho, fetchFromIpApiCo] as const) {
    try {
      const region = await provider();
      if (region?.location.countryCode) {
        logLocation("browser-region → resolved", {
          source: region.source,
          ip: region.ip,
          country: region.location.country,
          currency: region.currency,
          phone: region.phoneDialCode,
          language: region.defaultLanguage,
        });
        return region;
      }
    } catch (err) {
      logLocation("browser-region → provider failed", err);
    }
  }

  const locale = fallbackFromLocale();
  if (locale) logLocation("browser-region → locale fallback", locale.location);
  return locale;
}
