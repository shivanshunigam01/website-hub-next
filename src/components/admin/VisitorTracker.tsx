"use client";

import { useEffect, useRef } from "react";
import { useRouterState } from "@/lib/navigation";
import { useAdminStore } from "@/hooks/use-admin-store";
import { useTranslation } from "react-i18next";
import { detectUserLocationByIp } from "@/lib/geolocation";

const SESSION_KEY = "tp_visitor_logged_v1";

/**
 * Logs visitor analytics once per session. Uses IP geolocation for admin stats only —
 * not shown in the public UI when GPS is denied.
 */
export function VisitorTracker() {
  const { recordVisitor } = useAdminStore();
  const { i18n } = useTranslation();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const logged = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (logged.current) return;
    if (sessionStorage.getItem(SESSION_KEY)) {
      logged.current = true;
      return;
    }
    logged.current = true;

    (async () => {
      let ip: string | undefined;
      let country: string | undefined;
      let countryCode: string | undefined;
      let city: string | undefined;

      try {
        const ipResult = await detectUserLocationByIp();
        country = ipResult.location?.country;
        countryCode = ipResult.location?.countryCode;
        city = ipResult.location?.city;
      } catch {
        /* ignore */
      }

      recordVisitor({
        ip,
        country,
        countryCode,
        city,
        language: i18n.language,
        path,
        referrer: document.referrer || undefined,
        userAgent: navigator.userAgent,
      });

      sessionStorage.setItem(SESSION_KEY, "1");
    })();
  }, [recordVisitor, i18n.language, path]);

  return null;
}
