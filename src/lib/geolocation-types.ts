export type UserLocation = {
  country: string;
  countryCode: string;
  city: string;
  state?: string;
  formatted?: string;
};

export type GeoapifyReverseResponse = {
  type?: string;
  features?: Array<{
    type?: string;
    properties?: {
      country?: string;
      country_code?: string;
      city?: string;
      suburb?: string;
      district?: string;
      municipality?: string;
      county?: string;
      state?: string;
      formatted?: string;
    };
  }>;
};

export type LocationDebugInfo = {
  source: "ip" | "reverse";
  clientIp?: string;
  geoapifyEndpoint: string;
  geoapifyHttpStatus: number;
  geoapifyCityRaw?: string;
  geoapifyCountryRaw?: string;
  resolvedCity?: string;
  resolvedCountry?: string;
  durationMs: number;
  note?: string;
};

export type LocationPermission = "granted" | "denied" | "unsupported" | "unknown";

export type LocationDetectResult = {
  location: UserLocation | null;
  geoapify: GeoapifyReverseResponse | null;
  debug?: LocationDebugInfo;
  permission?: LocationPermission;
  /** Set when resolved from browser public IP (currency, ISD, language). */
  browserIp?: string | null;
  currency?: string;
  phoneDialCode?: string;
  defaultLanguage?: string;
  ipSource?: "browser" | "gps" | "none";
};
