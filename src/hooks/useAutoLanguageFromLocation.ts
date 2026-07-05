import { useEffect } from "react";
import i18n from "i18next";
import type { UserLocation } from "@/lib/geolocation";
import {
  applyGeoLanguage,
  isGoogleTranslateActive,
  LS_KEYS,
  persistLanguageChoice,
  resolveAutoLanguageForLocation,
} from "@/lib/google-translate";
import { syncDocumentLanguage } from "@/lib/document-language";
import { debugGtLog, gtDomSnapshot } from "@/lib/debug-gt-log";

/**
 * Sync language from detected country. Never calls i18n.changeLanguage while Google
 * Translate owns the DOM — that causes React removeChild crashes. Reload instead.
 */
export function useAutoLanguageFromLocation(location: UserLocation | null | undefined) {
  useEffect(() => {
    if (location === undefined || !location?.countryCode) return;

    const { shouldApplyGt, targetLang, countryCode, i18nLang, respectManualChoice } =
      resolveAutoLanguageForLocation(location);

    const gtActive = isGoogleTranslateActive();

    // #region agent log
    debugGtLog("B", "useAutoLanguageFromLocation.ts", "auto-language effect", {
      branch: shouldApplyGt && !respectManualChoice ? "applyGeo" : respectManualChoice ? "manual" : gtActive ? "gt-skip" : "i18n-sync",
      gtActive,
      shouldApplyGt,
      respectManualChoice,
      targetLang,
      i18nLang,
      i18nCurrent: i18n.language,
      countryCode,
      ...gtDomSnapshot(),
    });
    // #endregion

    if (shouldApplyGt && !respectManualChoice) {
      applyGeoLanguage(targetLang, countryCode, (lng) => {
        void i18n.changeLanguage(lng);
        syncDocumentLanguage(lng);
      });
      return;
    }

    if (respectManualChoice) {
      if (gtActive) return;
      if (i18n.language !== i18nLang) {
        // #region agent log
        debugGtLog("B", "useAutoLanguageFromLocation.ts", "calling i18n.changeLanguage (manual)", {
          from: i18n.language,
          to: i18nLang,
          ...gtDomSnapshot(),
        });
        // #endregion
        void i18n.changeLanguage(i18nLang);
        syncDocumentLanguage(i18nLang);
      }
      return;
    }

    if (gtActive) return;

    if (i18n.language !== i18nLang) {
      // #region agent log
      debugGtLog("B", "useAutoLanguageFromLocation.ts", "calling i18n.changeLanguage (geo)", {
        from: i18n.language,
        to: i18nLang,
        ...gtDomSnapshot(),
      });
      // #endregion
      void i18n.changeLanguage(i18nLang);
    }
    syncDocumentLanguage(i18nLang);

    localStorage.setItem(LS_KEYS.prompted, "1");
    localStorage.setItem(LS_KEYS.geoCountry, countryCode);
    persistLanguageChoice(targetLang, countryCode);
  }, [location?.countryCode, location?.city, location?.country]);
}
