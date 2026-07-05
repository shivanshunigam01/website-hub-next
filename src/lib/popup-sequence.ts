import { LS_KEYS } from "@/lib/google-translate";

/** Language / accommodation onboarding modals (disabled). */
export const ONBOARDING_POPUPS_ENABLED = false;

/** Geo-targeted CMS popup — one per browser session when admin content matches visitor location. */
export const REGIONAL_POPUP_ENABLED = true;

/** Fired when the language prompt is done (answered, skipped, or already completed). */
export const LANGUAGE_PROMPT_DONE_EVENT = "tp:language-prompt-done";
export function isLanguagePromptComplete(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem(LS_KEYS.prompted) || localStorage.getItem(LS_KEYS.selected));
}

export function completeLanguagePrompt() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(LANGUAGE_PROMPT_DONE_EVENT));
}

export function onLanguagePromptComplete(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  if (isLanguagePromptComplete()) {
    handler();
    return () => {};
  }
  window.addEventListener(LANGUAGE_PROMPT_DONE_EVENT, handler);
  return () => window.removeEventListener(LANGUAGE_PROMPT_DONE_EVENT, handler);
}

/** Delay before the regional CMS popup appears after location + banners load. */
export const REGIONAL_POPUP_DELAY_MS = 600;