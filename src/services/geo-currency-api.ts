import { apiPublic } from "@/lib/api";
import { detectBrowserRegion } from "@/lib/browser-region";
import { getCurrencySymbol } from "@/lib/currencies";

export type GeoCurrencyResult = {
  countryCode?: string | null;
  country?: string | null;
  currency: string;
  symbol: string;
  source: "browser" | "query" | "default" | string;
  phoneDialCode?: string;
};

/** Explicit country override (admin/tools). Visitor UI uses browser IP via LocationProvider. */
export async function fetchCurrencyFromGeo(countryCode?: string): Promise<GeoCurrencyResult> {
  if (countryCode) {
    return apiPublic<GeoCurrencyResult>(
      `/geo/currency?countryCode=${encodeURIComponent(countryCode)}`,
    );
  }

  const region = await detectBrowserRegion();
  if (region) {
    return {
      countryCode: region.location.countryCode,
      country: region.location.country,
      currency: region.currency,
      symbol: getCurrencySymbol(region.currency),
      source: "browser",
      phoneDialCode: region.phoneDialCode,
    };
  }

  return {
    countryCode: null,
    country: null,
    currency: "USD",
    symbol: "$",
    source: "default",
  };
}
