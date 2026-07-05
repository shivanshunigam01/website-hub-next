"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CURRENCIES, detectCurrencyFromLocale, getCurrencySymbol } from "@/lib/currencies";
import { convertCurrency, formatLocalizedPrice as formatLocalizedPriceFn } from "@/lib/currency-convert";
import { getCurrencyForCountryCode } from "@/lib/currency-from-country";
import { useLocationContext } from "@/hooks/use-user-location";

export type CurrencySource = "manual" | "browser" | "locale" | "default";

type CurrencyContextValue = {
  currency: string;
  symbol: string;
  countryCode?: string;
  source: CurrencySource;
  isLoading: boolean;
  setPreferredCurrency: (code: string) => void;
  formatLocalizedPrice: (
    amount: number | string,
    sourceCurrency?: string | null,
    options?: { showCode?: boolean },
  ) => string;
  convertAmount: (amount: number, sourceCurrency?: string | null) => number;
};

const STORAGE_KEY = "tp_preferred_currency";
const SUPPORTED = new Set<string>(CURRENCIES.map((c) => c.code));

const CurrencyCtx = createContext<CurrencyContextValue | null>(null);

function readManualPreference(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(STORAGE_KEY)?.trim().toUpperCase();
    return v && SUPPORTED.has(v) ? v : null;
  } catch {
    return null;
  }
}

function applyCurrencyState(
  code: string,
  resolvedCountry: string | undefined,
  nextSource: CurrencySource,
  setter: {
    setCurrency: (v: string) => void;
    setSymbol: (v: string) => void;
    setCountryCode: (v: string | undefined) => void;
    setSource: (v: CurrencySource) => void;
  },
) {
  setter.setCurrency(code);
  setter.setSymbol(getCurrencySymbol(code));
  setter.setCountryCode(resolvedCountry);
  setter.setSource(nextSource);
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const {
    countryCode: browserCountryCode,
    regionCurrency,
    status: locationStatus,
  } = useLocationContext();
  const [currency, setCurrency] = useState("USD");
  const [symbol, setSymbol] = useState("$");
  const [countryCode, setCountryCode] = useState<string | undefined>();
  const [source, setSource] = useState<CurrencySource>("default");
  const [isLoading, setIsLoading] = useState(true);

  const setter = useMemo(
    () => ({ setCurrency, setSymbol, setCountryCode, setSource }),
    [],
  );

  const setPreferredCurrency = useCallback(
    (code: string) => {
      const upper = code.trim().toUpperCase();
      if (!SUPPORTED.has(upper)) return;
      try {
        localStorage.setItem(STORAGE_KEY, upper);
      } catch {
        // ignore
      }
      applyCurrencyState(upper, countryCode, "manual", setter);
    },
    [countryCode, setter],
  );

  const formatLocalizedPrice = useCallback(
    (amount: number | string, sourceCurrency?: string | null, options?: { showCode?: boolean }) =>
      formatLocalizedPriceFn(amount, {
        sourceCurrency: sourceCurrency || currency,
        targetCurrency: currency,
        showCode: options?.showCode,
      }),
    [currency],
  );

  const convertAmount = useCallback(
    (amount: number, sourceCurrency?: string | null) =>
      convertCurrency(amount, sourceCurrency || currency, currency),
    [currency],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const manual = readManualPreference();
    if (manual) {
      applyCurrencyState(manual, undefined, "manual", setter);
      setIsLoading(false);
      return;
    }

    if (locationStatus === "loading") return;

    if (regionCurrency && SUPPORTED.has(regionCurrency)) {
      applyCurrencyState(
        regionCurrency,
        browserCountryCode?.toUpperCase(),
        "browser",
        setter,
      );
      setIsLoading(false);
      return;
    }

    if (browserCountryCode) {
      const code = getCurrencyForCountryCode(browserCountryCode);
      applyCurrencyState(code, browserCountryCode.toUpperCase(), "browser", setter);
      setIsLoading(false);
      return;
    }

    const localeCurrency = detectCurrencyFromLocale();
    applyCurrencyState(localeCurrency, undefined, "locale", setter);
    setIsLoading(false);
  }, [browserCountryCode, regionCurrency, locationStatus, setter]);

  useEffect(() => {
    if (readManualPreference() || locationStatus === "loading") return;
    if (regionCurrency && SUPPORTED.has(regionCurrency)) {
      applyCurrencyState(regionCurrency, browserCountryCode?.toUpperCase(), "browser", setter);
      return;
    }
    if (!browserCountryCode) return;
    const code = getCurrencyForCountryCode(browserCountryCode);
    applyCurrencyState(code, browserCountryCode.toUpperCase(), "browser", setter);
  }, [browserCountryCode, regionCurrency, locationStatus, setter]);

  return (
    <CurrencyCtx.Provider
      value={{
        currency,
        symbol,
        countryCode,
        source,
        isLoading,
        setPreferredCurrency,
        formatLocalizedPrice,
        convertAmount,
      }}
    >
      {children}
    </CurrencyCtx.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyCtx);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
