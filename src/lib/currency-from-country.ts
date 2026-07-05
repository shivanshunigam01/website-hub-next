/** ISO 3166-1 alpha-2 → ISO 4217 (mirrors backend `currencyFromCountry.js`). */
export const COUNTRY_TO_CURRENCY: Record<string, string> = {
  US: "USD",
  CA: "CAD",
  GB: "GBP",
  UK: "GBP",
  IE: "EUR",
  FR: "EUR",
  DE: "EUR",
  ES: "EUR",
  IT: "EUR",
  PT: "EUR",
  NL: "EUR",
  BE: "EUR",
  AT: "EUR",
  FI: "EUR",
  GR: "EUR",
  LU: "EUR",
  MT: "EUR",
  CY: "EUR",
  EE: "EUR",
  LV: "EUR",
  LT: "EUR",
  SK: "EUR",
  SI: "EUR",
  HR: "EUR",
  IN: "INR",
  AE: "AED",
  SA: "SAR",
  AU: "AUD",
  SG: "SGD",
  PK: "PKR",
  BD: "BDT",
  LK: "LKR",
  NP: "NPR",
  JP: "JPY",
  CN: "CNY",
  HK: "HKD",
  CH: "CHF",
  SE: "SEK",
  NO: "NOK",
  DK: "DKK",
  ZA: "ZAR",
  BR: "BRL",
  MX: "MXN",
  NZ: "NZD",
  TR: "TRY",
  RU: "RUB",
  KR: "KRW",
  TH: "THB",
  MY: "MYR",
  ID: "IDR",
  PH: "PHP",
  VN: "VND",
  EG: "EGP",
  NG: "NGN",
  KE: "KES",
};

const SUPPORTED_CURRENCIES = new Set(Object.values(COUNTRY_TO_CURRENCY));

export function normalizeCountryCode(code?: string | null): string {
  const upper = String(code || "")
    .trim()
    .toUpperCase();
  if (!upper) return "";
  if (upper === "UK") return "GB";
  return upper;
}

export function getCurrencyForCountryCode(countryCode?: string | null): string {
  const normalized = normalizeCountryCode(countryCode);
  if (!normalized) return "USD";
  const currency = COUNTRY_TO_CURRENCY[normalized];
  if (currency && SUPPORTED_CURRENCIES.has(currency)) return currency;
  return "USD";
}