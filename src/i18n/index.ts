import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enCommon from "../../public/locales/en/common.json";
import zhCommon from "../../public/locales/zh/common.json";
import frCommon from "../../public/locales/fr/common.json";
import deCommon from "../../public/locales/de/common.json";
import esCommon from "../../public/locales/es/common.json";
import itCommon from "../../public/locales/it/common.json";
import hiCommon from "../../public/locales/hi/common.json";
import arCommon from "../../public/locales/ar/common.json";

export const SUPPORTED_LANGUAGES = ["en", "zh", "fr", "de", "es", "it", "hi", "ar"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const resources = {
  en: { common: enCommon },
  zh: { common: zhCommon },
  fr: { common: frCommon },
  de: { common: deCommon },
  es: { common: esCommon },
  it: { common: itCommon },
  hi: { common: hiCommon },
  ar: { common: arCommon },
};

void i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    fallbackLng: "en",
    supportedLngs: [...SUPPORTED_LANGUAGES],
    ns: ["common"],
    defaultNS: "common",
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

export default i18n;
