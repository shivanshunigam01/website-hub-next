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
import { deferUntilIdle } from "@/lib/defer-until-idle";

/**
 * Sync language from detected country. Never calls i18n.changeLanguage while Google
 * Translate owns the DOM — that causes React removeChild crashes. Reload instead.
 */
export function useAutoLanguageFromLocation(location: UserLocation | null | undefined) {
  useEffect(() => {
    if (location === undefined || !location?.countryCode) return;

    deferUntilIdle(() => {
      const { shouldApplyGt, targetLang, countryCode, i18nLang, respectManualChoice } =
        resolveAutoLanguageForLocation(location);

      const gtActive = isGoogleTranslateActive();

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
          void i18n.changeLanguage(i18nLang);
          syncDocumentLanguage(i18nLang);
        }
        return;
      }

      if (gtActive) return;

      if (i18n.language !== i18nLang) {
        void i18n.changeLanguage(i18nLang);
      }
      syncDocumentLanguage(i18nLang);

      localStorage.setItem(LS_KEYS.prompted, "1");
      localStorage.setItem(LS_KEYS.geoCountry, countryCode);
      persistLanguageChoice(targetLang, countryCode);
    }, 8000);
  }, [location?.countryCode, location?.city, location?.country]);
}
