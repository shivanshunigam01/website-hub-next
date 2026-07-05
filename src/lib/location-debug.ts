"use client";

import type { LocationDetectResult, LocationDebugInfo } from "@/lib/geolocation-types";

export const LOCATION_DEBUG = process.env.NODE_ENV === 'development';

export function logLocation(step: string, payload: unknown) {
  if (!LOCATION_DEBUG) return;
  console.info(`[TeacherPoint · Location] ${step}`, payload);
}

export function logLocationApi(
  label: string,
  url: string,
  status: number,
  body: unknown,
  ms: number,
) {
  if (!LOCATION_DEBUG) return;
  console.groupCollapsed(
    `%c[Location API] ${label}`,
    status >= 200 && status < 300 ? "color:#15803d;font-weight:bold" : "color:#b91c1c;font-weight:bold",
    `· ${status} · ${ms}ms`,
  );
  console.log("Network URL (DevTools → Network):", url);
  console.log("Response:", body);
  const debug = (body as { debug?: LocationDebugInfo } | null)?.debug;
  if (debug) console.table(debug);
  console.groupEnd();
}

/** Inspect in console: `window.__tpLocation` */
export function exposeLocationDebug(result: LocationDetectResult & { debug?: LocationDebugInfo }) {
  if (typeof window === "undefined" || !LOCATION_DEBUG) return;
  (window as Window & { __tpLocation?: unknown }).__tpLocation = result;
}
