import { getCurrencySymbol } from "@/lib/currencies";

/** Approximate units of each currency per 1 USD (for display conversion). */
export const USD_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83,
  AED: 3.67,
  SAR: 3.75,
  AUD: 1.53,
  CAD: 1.36,
  SGD: 1.34,
  PKR: 278,
  BDT: 110,
  LKR: 300,
  NPR: 133,
  JPY: 149,
  CNY: 7.24,
  HKD: 7.82,
  CHF: 0.88,
  SEK: 10.5,
  NOK: 10.6,
  DKK: 6.85,
  ZAR: 18.5,
  BRL: 4.95,
  MXN: 17.1,
  NZD: 1.64,
  TRY: 32,
  RUB: 92,
  KRW: 1320,
  THB: 35,
  MYR: 4.72,
  IDR: 15700,
  PHP: 56,
  VND: 24500,
  EGP: 48,
  NGN: 1550,
  KES: 129,
};

export function convertCurrency(
  amount: number,
  fromCurrency?: string | null,
  toCurrency?: string | null,
): number {
  const from = (fromCurrency || "USD").toUpperCase();
  const to = (toCurrency || "USD").toUpperCase();
  if (from === to) return amount;
  const n = Number(amount);
  if (!Number.isFinite(n)) return 0;
  const fromRate = USD_RATES[from] ?? 1;
  const toRate = USD_RATES[to] ?? 1;
  const usd = n / fromRate;
  return usd * toRate;
}

export function formatLocalizedPrice(
  amount: number | string,
  options: {
    sourceCurrency?: string | null;
    targetCurrency: string;
    showCode?: boolean;
  },
): string {
  const { sourceCurrency, targetCurrency, showCode = false } = options;
  const source = (sourceCurrency || targetCurrency).toUpperCase();
  const target = targetCurrency.toUpperCase();
  const raw = Number(amount);
  const converted = Number.isFinite(raw) ? convertCurrency(raw, source, target) : 0;
  const decimals = ["JPY", "KRW", "VND", "IDR"].includes(target) ? 0 : 0;
  const formatted = converted.toLocaleString(undefined, {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  });
  const symbol = getCurrencySymbol(target);
  const display = `${symbol}${formatted}`;
  return showCode ? `${display} ${target}` : display;
}
