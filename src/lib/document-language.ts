/**
 * Site layout always stays LTR (navbar left, content flow left-to-right).
 * Arabic and other RTL languages only change translated text — not mirror the UI.
 * CSS in styles.css enforces LTR; avoid MutationObservers here (they freeze the page with GT).
 */

export function enforceLtrLayout() {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  if (root.getAttribute("dir") !== "ltr") {
    root.setAttribute("dir", "ltr");
  }

  const body = document.body;
  if (body && body.getAttribute("dir") !== "ltr") {
    body.setAttribute("dir", "ltr");
  }
}

export function syncDocumentLanguage(lang: string) {
  if (typeof document === "undefined") return;

  const code = lang?.trim() || "en";
  const root = document.documentElement;
  root.lang = code;
  root.dataset.contentLang = code;
  enforceLtrLayout();
}
