// Common currencies supported in the app.
import { COUNTRY_TO_CURRENCY } from "@/lib/currency-from-country";

export const CURRENCIES = [
  { code: "USD", label: "USD — US Dollar", symbol: "$" },
  { code: "EUR", label: "EUR — Euro", symbol: "€" },
  { code: "GBP", label: "GBP — British Pound", symbol: "£" },
  { code: "INR", label: "INR — Indian Rupee", symbol: "₹" },
  { code: "AED", label: "AED — UAE Dirham", symbol: "د.إ" },
  { code: "SAR", label: "SAR — Saudi Riyal", symbol: "﷼" },
  { code: "AUD", label: "AUD — Australian Dollar", symbol: "A$" },
  { code: "CAD", label: "CAD — Canadian Dollar", symbol: "C$" },
  { code: "SGD", label: "SGD — Singapore Dollar", symbol: "S$" },
  { code: "PKR", label: "PKR — Pakistani Rupee", symbol: "₨" },
  { code: "BDT", label: "BDT — Bangladeshi Taka", symbol: "৳" },
  { code: "LKR", label: "LKR — Sri Lankan Rupee", symbol: "Rs" },
  { code: "NPR", label: "NPR — Nepalese Rupee", symbol: "₨" },
  { code: "JPY", label: "JPY — Japanese Yen", symbol: "¥" },
  { code: "CNY", label: "CNY — Chinese Yuan", symbol: "¥" },
  { code: "HKD", label: "HKD — Hong Kong Dollar", symbol: "HK$" },
  { code: "CHF", label: "CHF — Swiss Franc", symbol: "Fr" },
  { code: "SEK", label: "SEK — Swedish Krona", symbol: "kr" },
  { code: "NOK", label: "NOK — Norwegian Krone", symbol: "kr" },
  { code: "DKK", label: "DKK — Danish Krone", symbol: "kr" },
  { code: "ZAR", label: "ZAR — South African Rand", symbol: "R" },
  { code: "BRL", label: "BRL — Brazilian Real", symbol: "R$" },
  { code: "MXN", label: "MXN — Mexican Peso", symbol: "$" },
  { code: "NZD", label: "NZD — New Zealand Dollar", symbol: "NZ$" },
  { code: "TRY", label: "TRY — Turkish Lira", symbol: "₺" },
  { code: "RUB", label: "RUB — Russian Ruble", symbol: "₽" },
  { code: "KRW", label: "KRW — South Korean Won", symbol: "₩" },
  { code: "THB", label: "THB — Thai Baht", symbol: "฿" },
  { code: "MYR", label: "MYR — Malaysian Ringgit", symbol: "RM" },
  { code: "IDR", label: "IDR — Indonesian Rupiah", symbol: "Rp" },
  { code: "PHP", label: "PHP — Philippine Peso", symbol: "₱" },
  { code: "VND", label: "VND — Vietnamese Dong", symbol: "₫" },
  { code: "EGP", label: "EGP — Egyptian Pound", symbol: "£" },
  { code: "NGN", label: "NGN — Nigerian Naira", symbol: "₦" },
  { code: "KES", label: "KES — Kenyan Shilling", symbol: "KSh" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

const REGION_TO_CURRENCY = COUNTRY_TO_CURRENCY;

// Map a few common IANA timezones to a region as a backup.
const TIMEZONE_TO_REGION: Record<string, string> = {
  "Asia/Kolkata": "IN", "Asia/Calcutta": "IN",
  "Asia/Dubai": "AE", "Asia/Riyadh": "SA", "Asia/Karachi": "PK",
  "Asia/Dhaka": "BD", "Asia/Colombo": "LK", "Asia/Kathmandu": "NP",
  "Asia/Singapore": "SG", "Asia/Hong_Kong": "HK", "Asia/Tokyo": "JP",
  "Asia/Shanghai": "CN", "Asia/Seoul": "KR", "Asia/Bangkok": "TH",
  "Asia/Kuala_Lumpur": "MY", "Asia/Jakarta": "ID", "Asia/Manila": "PH",
  "Asia/Ho_Chi_Minh": "VN", "Africa/Cairo": "EG", "Africa/Lagos": "NG",
  "Africa/Nairobi": "KE", "Africa/Johannesburg": "ZA",
  "Europe/London": "GB", "Europe/Paris": "FR", "Europe/Berlin": "DE",
  "Europe/Madrid": "ES", "Europe/Rome": "IT", "Europe/Amsterdam": "NL",
  "Europe/Stockholm": "SE", "Europe/Oslo": "NO", "Europe/Copenhagen": "DK",
  "Europe/Zurich": "CH", "Europe/Moscow": "RU", "Europe/Istanbul": "TR",
  "America/New_York": "US", "America/Chicago": "US", "America/Denver": "US",
  "America/Los_Angeles": "US", "America/Toronto": "CA", "America/Vancouver": "CA",
  "America/Mexico_City": "MX", "America/Sao_Paulo": "BR",
  "Australia/Sydney": "AU", "Australia/Melbourne": "AU", "Pacific/Auckland": "NZ",
};

const SUPPORTED = new Set<string>(CURRENCIES.map((c) => c.code));

/** Detect best-guess currency from the browser locale / timezone. */
export function detectCurrencyFromLocale(): string {
  if (typeof window === "undefined") return "USD";
  try {
    const locale = navigator.language || "en-US";
    const region = locale.split("-")[1]?.toUpperCase();
    if (region && REGION_TO_CURRENCY[region]) {
      const c = REGION_TO_CURRENCY[region];
      if (SUPPORTED.has(c)) return c;
    }
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const tzRegion = TIMEZONE_TO_REGION[tz];
    if (tzRegion && REGION_TO_CURRENCY[tzRegion]) {
      const c = REGION_TO_CURRENCY[tzRegion];
      if (SUPPORTED.has(c)) return c;
    }
  } catch {
    // ignore
  }
  return "USD";
}

export function getCurrencySymbol(code?: string): string {
  return CURRENCIES.find((c) => c.code === code)?.symbol || code || "$";
}

/** Format a price using the item's stored currency (no FX conversion). */
export function formatPrice(amount: number | string, currency?: string | null): string {
  const code = currency || "USD";
  const symbol = getCurrencySymbol(code);
  const n = Number(amount);
  if (Number.isNaN(n)) return `${symbol}${amount}`;
  return `${symbol}${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function formatPriceWithCode(amount: number | string, currency?: string | null): string {
  const code = currency || "USD";
  return `${formatPrice(amount, code)} ${code}`;
}
