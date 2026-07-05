import type { Accommodation } from "@/hooks/use-admin-store";
import type { UserLocation } from "@/lib/geolocation-types";

/** Map ISO codes and common names to a single comparison key. */
const COUNTRY_KEYS: Record<string, string> = {
  in: "india",
  india: "india",
  ae: "uae",
  uae: "uae",
  "united arab emirates": "uae",
  gb: "uk",
  uk: "uk",
  "united kingdom": "uk",
  "great britain": "uk",
  us: "usa",
  usa: "usa",
  "united states": "usa",
  "united states of america": "usa",
};

function countryKey(country?: string, countryCode?: string): string {
  const code = (countryCode ?? "").toLowerCase().trim();
  if (code && COUNTRY_KEYS[code]) return COUNTRY_KEYS[code];

  const name = (country ?? "").toLowerCase().trim();
  if (name && COUNTRY_KEYS[name]) return COUNTRY_KEYS[name];

  return name || code;
}

export function accommodationMatchesUserCountry(
  accommodation: Accommodation,
  location: UserLocation | null | undefined,
): boolean {
  if (!location?.country && !location?.countryCode) return true;

  const userKey = countryKey(location.country, location.countryCode);
  const listingKey = countryKey(accommodation.country);
  if (!userKey || !listingKey) return true;

  return userKey === listingKey;
}

function cityMatchScore(city: string, userCity: string): number {
  const listingCity = city.toLowerCase().trim();
  const detected = userCity.toLowerCase().trim();
  const detectedBase = detected.split("(")[0]?.trim() ?? detected;

  if (!detected) return 2;
  if (listingCity === detected || listingCity === detectedBase) return 0;
  if (detected.includes(listingCity) || listingCity.includes(detectedBase)) return 1;
  if (detectedBase.includes(listingCity) || listingCity.includes(detectedBase.split(" ")[0] ?? "")) {
    return 1;
  }
  return 2;
}

/** Keep only listings in the visitor's country when geo is known. */
export function filterAccommodationsByUserCountry(
  list: Accommodation[],
  location: UserLocation | null | undefined,
  hasLocationAccess: boolean,
): Accommodation[] {
  if (!hasLocationAccess || !location) return list;
  return list.filter((a) => accommodationMatchesUserCountry(a, location));
}

/** Same-country listings first; closer city matches rise to the top. */
export function sortAccommodationsByProximity(
  list: Accommodation[],
  location: UserLocation | null | undefined,
): Accommodation[] {
  if (!location?.city) return list;
  return [...list].sort(
    (a, b) => cityMatchScore(a.city, location.city) - cityMatchScore(b.city, location.city),
  );
}

export function getAccommodationsForUser(
  list: Accommodation[],
  location: UserLocation | null | undefined,
  hasLocationAccess: boolean,
  { includeAllCountries = false } = {},
): Accommodation[] {
  const available = list.filter((a) => a.available);
  const scoped = includeAllCountries
    ? available
    : filterAccommodationsByUserCountry(available, location, hasLocationAccess);
  return sortAccommodationsByProximity(scoped, location);
}

export function userCountryLabel(location: UserLocation | null | undefined): string | null {
  if (!location?.country) return null;
  return location.country;
}
