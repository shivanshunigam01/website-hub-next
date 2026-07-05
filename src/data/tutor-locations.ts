import { PHONE_COUNTRY_CODES } from "@/lib/phone-codes";

/** Alphabetical country list for the tutor browse sidebar. */
export const BROWSE_COUNTRIES: string[] = (() => {
  const seen = new Set<string>();
  const list: string[] = [];
  for (const { label } of PHONE_COUNTRY_CODES) {
    if (!seen.has(label)) {
      seen.add(label);
      list.push(label);
    }
  }
  return list.sort((a, b) => a.localeCompare(b));
})();

export const ONLINE_LOCATION_LABEL = "Online";
