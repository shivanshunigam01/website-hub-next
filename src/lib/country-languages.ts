import { SUPPORTED_LANGUAGES, type SupportedLanguage } from "@/i18n";
import type { UserLocation } from "@/lib/geolocation";

export const ALL_LANGUAGES: SupportedLanguage[] = [...SUPPORTED_LANGUAGES];

/** Languages recommended for a detected country / city (shown at top of switcher). */
export function getRecommendedLanguagesForLocation(
  location: UserLocation | null,
): SupportedLanguage[] {
  if (!location) return ["en"];

  const country = location.countryCode?.toLowerCase() ?? "";
  const city = (location.city ?? "").toLowerCase();

  if (country === "in") return ["en", "hi"];
  if (
    country === "ae" ||
    city.includes("dubai") ||
    city.includes("abu dhabi") ||
    ["sa", "qa", "kw", "bh", "om", "eg", "jo", "ma", "tn", "dz", "ly", "iq", "ye", "sy", "lb", "ps"].includes(country)
  ) {
    return ["ar", "en"];
  }
  if (country === "jp") return ["en"];
  if (country === "kr") return ["en"];
  if (["cn", "hk", "tw", "sg"].includes(country)) return ["zh", "en"];
  if (country === "fr" || ["be", "lu", "mc", "ci", "sn", "ml", "bf"].includes(country)) return ["fr", "en"];
  if (country === "de" || ["at", "ch", "li"].includes(country)) return ["de", "en"];
  if (country === "es" || ["mx", "ar", "co", "cl", "pe", "ve", "uy", "py", "bo", "ec", "gt", "cu", "do", "hn", "sv", "ni", "cr", "pa"].includes(country)) return ["es", "en"];
  if (country === "it" || country === "sm" || country === "va") return ["it", "en"];

  return ["en"];
}

/** All languages available, with recommended ones first. */
export function getLanguageOptionsForLocation(
  location: UserLocation | null,
): { recommended: SupportedLanguage[]; others: SupportedLanguage[] } {
  const recommended = getRecommendedLanguagesForLocation(location);
  const others = ALL_LANGUAGES.filter((l) => !recommended.includes(l));
  return { recommended, others };
}

/** Default language applied on first visit (no manual choice in localStorage). */
export function getDefaultLanguageForLocation(location: UserLocation | null): SupportedLanguage {
  return getRecommendedLanguagesForLocation(location)[0] ?? "en";
}

/** Layout stays LTR site-wide; Arabic only affects translated copy. */
export function isRtlLanguage(_code: string): boolean {
  return false;
}
