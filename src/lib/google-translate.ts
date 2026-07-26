import type { UserLocation } from "@/lib/geolocation";
import { debugGtLog, gtDomSnapshot } from "@/lib/debug-gt-log";

export type GTLanguage = {
  code: string; // Google Translate code, e.g. "hi", "zh-CN", "ar"
  native: string;
  english: string;
  flag: string;
};

/** Only languages with bundled i18next locales — avoid silent English fallback. */
export const GT_LANGUAGES: GTLanguage[] = [
  { code: "en", native: "English", english: "English", flag: "🇬🇧" },
  { code: "hi", native: "हिन्दी", english: "Hindi", flag: "🇮🇳" },
  { code: "ar", native: "العربية", english: "Arabic", flag: "🇸🇦" },
  { code: "zh-CN", native: "中文", english: "Chinese", flag: "🇨🇳" },
  { code: "fr", native: "Français", english: "French", flag: "🇫🇷" },
  { code: "de", native: "Deutsch", english: "German", flag: "🇩🇪" },
  { code: "es", native: "Español", english: "Spanish", flag: "🇪🇸" },
  { code: "it", native: "Italiano", english: "Italian", flag: "🇮🇹" },
];

export const GT_INCLUDED = GT_LANGUAGES.filter((l) => l.code !== "en")
  .map((l) => l.code)
  .join(",");

export function getLanguageMeta(code: string): GTLanguage {
  return GT_LANGUAGES.find((l) => l.code === code) ?? GT_LANGUAGES[0];
}

/** Map a detected location to a suggested Google Translate language code. */
export function suggestLanguageForLocation(location: UserLocation | null): string {
  if (!location) return "en";
  const country = (location.countryCode ?? "").toLowerCase();
  const city = (location.city ?? "").toLowerCase();

  if (country === "in") return "en";
  if (
    ["ae", "sa", "qa", "kw", "bh", "om", "eg", "jo", "ma", "tn", "dz", "ly", "iq", "ye", "sy", "lb", "ps"].includes(
      country,
    ) ||
    city.includes("dubai") ||
    city.includes("abu dhabi") ||
    city.includes("riyadh") ||
    city.includes("jeddah")
  )
    return "ar";
  if (["cn", "hk", "tw", "sg"].includes(country)) return "zh-CN";
  if (country === "fr" || ["be", "lu", "mc", "ci", "sn", "ml", "bf"].includes(country)) return "fr";
  if (country === "de" || ["at", "ch", "li"].includes(country)) return "de";
  if (
    country === "es" ||
    ["mx", "ar", "co", "cl", "pe", "ve", "uy", "py", "bo", "ec", "gt", "cu", "do", "hn", "sv", "ni", "cr", "pa"].includes(country)
  )
    return "es";
  if (country === "it" || country === "sm" || country === "va") return "it";
  // Unsupported locales fall back to English (no bundled i18n resources).
  if (country === "pt" || country === "br") return "en";
  if (country === "ru" || ["by", "kz", "kg", "tj"].includes(country)) return "en";
  if (country === "jp") return "en";
  if (country === "kr") return "en";
  if (country === "tr") return "en";
  if (country === "id") return "en";
  if (country === "vn") return "en";
  if (country === "th") return "en";

  return "en";
}

/** Layout stays LTR site-wide; do not mirror the UI for RTL languages. */
export function isRtl(_code: string): boolean {
  return false;
}

const COOKIE_NAME = "googtrans";

function getRootDomain(): string | null {
  if (typeof window === "undefined") return null;
  const host = window.location.hostname;
  // localhost/IPs: no domain attribute
  if (host === "localhost" || /^[\d.]+$/.test(host)) return null;
  const parts = host.split(".");
  if (parts.length < 2) return null;
  return "." + parts.slice(-2).join(".");
}

function writeCookie(value: string) {
  if (typeof document === "undefined") return;
  const expires = "; path=/";
  document.cookie = `${COOKIE_NAME}=${value}${expires}`;
  const root = getRootDomain();
  if (root) document.cookie = `${COOKIE_NAME}=${value}${expires}; domain=${root}`;
}

function clearCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  const root = getRootDomain();
  if (root)
    document.cookie = `${COOKIE_NAME}=; path=/; domain=${root}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

/** Read the currently active translation target from the googtrans cookie. */
export function getCurrentLanguage(): string {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(/(?:^|; )googtrans=([^;]+)/);
  if (!match) return "en";
  const parts = decodeURIComponent(match[1]).split("/");
  return parts[2] || "en";
}

/** Write googtrans cookie without reloading (used before a guarded reload). */
export function setLanguageCookie(code: string) {
  if (code === "en") clearCookie();
  else writeCookie(`/en/${code}`);
}

const RELOAD_GUARD_KEY = "tp.langReloadGuard";

/** Prevent auto-language from reloading the page in a tight loop. */
export function canReloadForLanguage(targetLang: string): boolean {
  if (typeof window === "undefined") return true;
  const stamp = sessionStorage.getItem(RELOAD_GUARD_KEY);
  const now = Date.now();
  if (stamp) {
    const [lang, at] = stamp.split(":");
    if (lang === targetLang && now - Number(at) < 8000) return false;
  }
  sessionStorage.setItem(RELOAD_GUARD_KEY, `${targetLang}:${now}`);
  return true;
}

/** True when Google Translate has modified the page (cookie or DOM markers). */
export function isGoogleTranslateActive(): boolean {
  if (typeof window === "undefined") return false;
  if (getCurrentLanguage() !== "en") return true;
  const html = document.documentElement;
  return html.classList.contains("translated-ltr") || html.classList.contains("translated-rtl");
}

/** Unwrap GT <font> nodes so React can unmount safely if reload is delayed a frame. */
export function unwrapGoogleTranslateDom() {
  if (typeof document === "undefined") return;
  try {
    document.querySelectorAll("font").forEach((node) => {
      const font = node;
      const parent = font.parentNode;
      if (!parent) return;
      while (font.firstChild) {
        parent.insertBefore(font.firstChild, font);
      }
      parent.removeChild(font);
    });
  } catch {
    // ignore
  }
}

/** Hard navigation — avoids React reconciling against GT-mutated DOM. */
export function reloadForLanguageChange(code: string, countryCode?: string) {
  if (typeof window === "undefined") return;
  persistLanguageChoice(code, countryCode);
  setLanguageCookie(code);
  unwrapGoogleTranslateDom();
  window.location.replace(window.location.href);
}

/** Switch site to the given language by setting the Google Translate cookie and reloading. */
export function applyLanguage(code: string, countryCode?: string) {
  if (typeof window === "undefined") return;
  reloadForLanguageChange(code, countryCode);
}

/** GT codes that map to bundled i18next locales (no Google Translate DOM mutation). */
export const I18N_GT_CODES = new Set([
  "en",
  "hi",
  "ar",
  "zh-CN",
  "fr",
  "de",
  "es",
  "it",
]);

/** True when the language can be applied via i18next without Google Translate. */
export function canApplyViaI18n(code: string): boolean {
  return I18N_GT_CODES.has(code);
}

/** Clear googtrans cookies so Google Translate cannot mutate the React DOM after hydration. */
export function clearGoogleTranslateCookies() {
  clearCookie();
}

/**
 * Apply a language in the Next.js app via i18next only.
 * Google Translate DOM mutation after hydration breaks all React click handlers.
 */
export function applyLanguageViaI18n(
  code: string,
  countryCode: string | undefined,
  changeLanguage: (lng: string) => void | Promise<unknown>,
  options?: { manual?: boolean },
) {
  if (typeof window === "undefined") return;
  clearGoogleTranslateCookies();
  if (options?.manual) {
    markManualLanguageChoice(code, countryCode);
  } else {
    localStorage.setItem(LS_KEYS.prompted, "1");
    localStorage.removeItem(LS_KEYS.manualOverride);
    if (countryCode) localStorage.setItem(LS_KEYS.geoCountry, countryCode.toUpperCase());
  }
  persistLanguageChoice(code, countryCode);
  const i18nLang = gtToI18nCode(code);
  void changeLanguage(i18nLang);
}

/** User picked a language in the navbar. */
export function applyManualLanguage(
  code: string,
  countryCode?: string,
  changeLanguage?: (lng: string) => void | Promise<unknown>,
) {
  if (typeof window === "undefined") return;
  if (changeLanguage) {
    applyLanguageViaI18n(code, countryCode, changeLanguage, { manual: true });
    return;
  }
  if (canApplyViaI18n(code)) {
    applyLanguageViaI18n(code, countryCode, () => {}, { manual: true });
    return;
  }
  markManualLanguageChoice(code, countryCode);
  reloadForLanguageChange(code, countryCode);
}

export const LS_KEYS = {
  prompted: "tp.langPrompted",
  selected: "tp.langSelected",
  /** ISO country code when language was last synced to geo. */
  geoCountry: "tp.langGeoCountry",
  /** User explicitly picked a language for the current country (skip auto until country changes). */
  manualOverride: "tp.langManualOverride",
};

const I18N_LANGUAGE_KEY = "selectedLanguage";

/** Map Google Translate codes to i18next resource codes. */
export function gtToI18nCode(gtCode: string): string {
  if (gtCode === "zh-CN") return "zh";
  if (["en", "hi", "ar", "zh", "fr", "de", "es", "it"].includes(gtCode)) return gtCode;
  return "en";
}

export function persistLanguageChoice(gtCode: string, countryCode?: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEYS.selected, gtCode);
  localStorage.setItem(I18N_LANGUAGE_KEY, gtToI18nCode(gtCode));
  if (countryCode) {
    localStorage.setItem(LS_KEYS.geoCountry, countryCode.toUpperCase());
  }
}

export function markManualLanguageChoice(gtCode: string, countryCode?: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEYS.manualOverride, "1");
  localStorage.setItem(LS_KEYS.prompted, "1");
  persistLanguageChoice(gtCode, countryCode);
}

function readStoredLanguageChoice(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LS_KEYS.selected);
}

function hasManualLanguageOverride(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(LS_KEYS.manualOverride) === "1";
}

/**
 * Resolve the language for the detected country and whether Google Translate must reload.
 * Follows IP geo automatically (VPN-friendly). Only skips auto when the user picked a language in the navbar.
 */
export function resolveAutoLanguageForLocation(location: UserLocation | null): {
  shouldApplyGt: boolean;
  targetLang: string;
  countryCode: string;
  i18nLang: string;
  respectManualChoice: boolean;
} {
  const countryCode = (location?.countryCode ?? "").toUpperCase();
  const currentGt = getCurrentLanguage();
  const stored = readStoredLanguageChoice();
  const manual = hasManualLanguageOverride();
  const geoLang = suggestLanguageForLocation(location);
  const storedGeoCountry =
    typeof window !== "undefined" ? (localStorage.getItem(LS_KEYS.geoCountry) ?? "").toUpperCase() : "";

  // Manual override only applies for the same country; clear it when geo country changes.
  if (manual && stored && countryCode && storedGeoCountry && storedGeoCountry !== countryCode) {
    localStorage.removeItem(LS_KEYS.manualOverride);
  } else if (manual && stored) {
    return {
      shouldApplyGt: stored !== currentGt,
      targetLang: stored,
      countryCode,
      i18nLang: gtToI18nCode(stored),
      respectManualChoice: true,
    };
  }

  const targetLang = geoLang;
  const i18nLang = gtToI18nCode(targetLang);

  if (typeof window === "undefined" || !countryCode) {
    return { shouldApplyGt: false, targetLang: targetLang, countryCode, i18nLang, respectManualChoice: false };
  }

  return {
    shouldApplyGt: targetLang !== currentGt,
    targetLang,
    countryCode,
    i18nLang,
    respectManualChoice: false,
  };
}

/** Apply IP-detected language. In Next.js, prefer i18next over Google Translate reload. */
export function applyGeoLanguage(
  targetLang: string,
  countryCode: string,
  changeLanguage?: (lng: string) => void | Promise<unknown>,
) {
  if (typeof window === "undefined") return;

  if (changeLanguage && canApplyViaI18n(targetLang)) {
    applyLanguageViaI18n(targetLang, countryCode, changeLanguage);
    return;
  }

  if (changeLanguage) {
    applyLanguageViaI18n(targetLang, countryCode, changeLanguage);
    return;
  }

  localStorage.setItem(LS_KEYS.prompted, "1");
  localStorage.removeItem(LS_KEYS.manualOverride);
  persistLanguageChoice(targetLang, countryCode);

  if (targetLang === "en") {
    if (getCurrentLanguage() === "en") return;
    setLanguageCookie("en");
    if (canReloadForLanguage("en")) reloadForLanguageChange("en", countryCode);
    return;
  }

  if (getCurrentLanguage() === targetLang) return;
  setLanguageCookie(targetLang);
  if (canReloadForLanguage(targetLang)) reloadForLanguageChange(targetLang, countryCode);
}

/** Runs before React hydrates — keep LTR and clear GT cookies so React stays interactive. */
export function buildEarlyLanguageCookieScript(): string {
  return `(function(){try{document.documentElement.setAttribute("dir","ltr");window._tipon=function(){};window._tipoff=function(){};document.cookie="googtrans=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT";var h=location.hostname;if(h!=="localhost"&&!/[\\d.]+$/.test(h)){var p=h.split(".");if(p.length>=2)document.cookie="googtrans=;path=/;domain=."+p.slice(-2).join(".")+";expires=Thu, 01 Jan 1970 00:00:00 GMT"}}catch(e){}})();`;
}

/** CSS injected alongside the Google Translate widget — hides hover tooltips and highlights. */
export const GT_SUPPRESS_HOVER_CSS = `
  #goog-gt-tt,
  .goog-te-balloon-frame,
  .goog-tooltip,
  .goog-tooltip:hover,
  .goog-te-menu-frame,
  iframe.goog-te-menu-frame,
  .goog-te-menu2,
  div[id^="goog-gt-"] {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    pointer-events: none !important;
    width: 0 !important;
    height: 0 !important;
    max-height: 0 !important;
    overflow: hidden !important;
    position: fixed !important;
    top: -9999px !important;
    left: -9999px !important;
    z-index: -9999 !important;
  }
  font,
  font[style],
  .goog-text-highlight,
  .goog-text-highlight:hover {
    background-color: transparent !important;
    background: none !important;
    box-shadow: none !important;
    border: none !important;
    outline: none !important;
    pointer-events: none !important;
  }
  font a,
  font button,
  a font,
  button font {
    pointer-events: auto !important;
  }
  .hero-headline font,
  .hero-headline .goog-text-highlight {
    -webkit-text-fill-color: inherit !important;
    color: inherit !important;
  }
`;

/** Disable Google Translate hover popups that show the original text on mouseover. */
export function disableGoogleTranslateHoverUi() {
  if (typeof window === "undefined") return;

  const win = window as unknown as Record<string, unknown>;
  win._tipon = () => {};
  win._tipoff = () => {};

  const hideTooltipNodes = () => {
    document
      .querySelectorAll(
        "#goog-gt-tt, .goog-te-balloon-frame, .goog-tooltip, iframe.goog-te-menu-frame, div[id^='goog-gt-']",
      )
      .forEach((node) => {
        const el = node as HTMLElement;
        el.style.setProperty("display", "none", "important");
        el.style.setProperty("visibility", "hidden", "important");
        el.style.setProperty("pointer-events", "none", "important");
      });

    document.querySelectorAll(".goog-text-highlight").forEach((node) => {
      node.classList.remove("goog-text-highlight");
    });
  };

  hideTooltipNodes();
}
