"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  detectUserLocation,
  type GeoapifyReverseResponse,
  type UserLocation,
} from "@/lib/geolocation";
import type { LocationPermission } from "@/lib/geolocation-types";
import { logLocation, LOCATION_DEBUG } from "@/lib/location-debug";

type LocationStatus = "idle" | "loading" | "ready" | "error";

type LocationContextValue = {
  location: UserLocation | null;
  /** True when a city/country was resolved from browser IP. */
  hasLocationAccess: boolean;
  permission: LocationPermission | "loading";
  countryCode: string | undefined;
  /** ISO currency from browser IP country (INR, AED, USD, …). */
  regionCurrency: string | undefined;
  /** E.164 dial prefix from browser IP country (+91, +971, …). */
  phoneDialCode: string | null;
  /** Suggested Google Translate / i18n language for this country. */
  defaultLanguage: string | undefined;
  browserIp: string | null;
  geoapify: GeoapifyReverseResponse | null;
  status: LocationStatus;
  isLoading: boolean;
  retryLocation: () => void;
};

const LocationCtx = createContext<LocationContextValue | null>(null);

function geoDetectDelayMs(pathname: string): number {
  if (pathname === "/") {
    return 5500;
  }
  if (pathname.startsWith("/tutors") || pathname.startsWith("/accommodation")) {
    return 0;
  }
  return 4500;
}

export function LocationProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/";
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [geoapify, setGeoapify] = useState<GeoapifyReverseResponse | null>(null);
  const [permission, setPermission] = useState<LocationPermission | "loading">("loading");
  const [status, setStatus] = useState<LocationStatus>("idle");
  const [regionCurrency, setRegionCurrency] = useState<string | undefined>();
  const [phoneDialCode, setPhoneDialCode] = useState<string | null>(null);
  const [defaultLanguage, setDefaultLanguage] = useState<string | undefined>();
  const [browserIp, setBrowserIp] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const runDetect = useCallback(() => {
    setStatus("loading");
    setPermission("loading");

    return detectUserLocation()
      .then((result) => {
        const resolved = !!result.location;
        setLocation(result.location);
        setGeoapify(result.geoapify);
        setRegionCurrency(result.currency);
        setPhoneDialCode(result.phoneDialCode ?? null);
        setDefaultLanguage(result.defaultLanguage);
        setBrowserIp(result.browserIp ?? null);
        setPermission(result.permission ?? (resolved ? "granted" : "unknown"));
        setStatus(resolved ? "ready" : "error");
        logLocation("provider → final state", {
          permission: result.permission,
          hasLocationAccess: resolved,
          location: result.location,
          currency: result.currency,
          phoneDialCode: result.phoneDialCode,
          defaultLanguage: result.defaultLanguage,
          browserIp: result.browserIp,
          debug: result.debug,
        });
        if (LOCATION_DEBUG && typeof window !== "undefined") {
          console.info(
            "[TeacherPoint · Location] Tip: type `window.__tpLocation` in the console for the last API response.",
          );
        }
      })
      .catch((err) => {
        console.warn("[location] detection failed", err);
        setLocation(null);
        setRegionCurrency(undefined);
        setPhoneDialCode(null);
        setDefaultLanguage(undefined);
        setBrowserIp(null);
        setPermission("unknown");
        setStatus("error");
      });
  }, []);

  useEffect(() => {
    let cancelled = false;
    const start = () => {
      runDetect().then(() => {
        if (cancelled) return;
      });
    };

    const routeDelay = geoDetectDelayMs(pathname);
    const schedule = () => {
      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        const idleId = window.requestIdleCallback(() => start(), { timeout: routeDelay > 0 ? 8000 : 3000 });
        return () => window.cancelIdleCallback(idleId);
      }
      const timer = setTimeout(start, routeDelay > 0 ? routeDelay : 2000);
      return () => clearTimeout(timer);
    };

    const routeTimer = window.setTimeout(() => {
      if (cancelled) return;
      cancelDetect = schedule();
    }, routeDelay);

    let cancelDetect: (() => void) | undefined;
    return () => {
      cancelled = true;
      window.clearTimeout(routeTimer);
      cancelDetect?.();
    };
    // pathname read for first-paint route delay only; do not re-detect on client navigations
    // eslint-disable-next-line react-hooks/exhaustive-deps -- geoDetectDelayMs(pathname)
  }, [attempt, runDetect]);

  const retryLocation = useCallback(() => {
    setAttempt((n) => n + 1);
  }, []);

  const hasLocationAccess = !!location;
  const countryCode = status === "loading" ? undefined : location?.countryCode?.toLowerCase();

  return (
    <LocationCtx.Provider
      value={{
        location,
        hasLocationAccess,
        permission,
        countryCode,
        regionCurrency,
        phoneDialCode,
        defaultLanguage,
        browserIp,
        geoapify,
        status,
        isLoading: status === "loading" || permission === "loading",
        retryLocation,
      }}
    >
      {children}
    </LocationCtx.Provider>
  );
}

export function useLocationContext() {
  const ctx = useContext(LocationCtx);
  if (!ctx) throw new Error("useLocationContext must be used within LocationProvider");
  return ctx;
}

/** @deprecated Use useLocationContext */
export function useUserLocation() {
  const { location, status, isLoading, hasLocationAccess } = useLocationContext();
  return { location, status, isLoading, hasLocationAccess };
}
