/** Debug session a5a1cd — GT + React removeChild investigation */
export function debugGtLog(
  hypothesisId: string,
  location: string,
  message: string,
  data?: Record<string, unknown>,
) {
  // #region agent log
  fetch("http://127.0.0.1:7651/ingest/ed07b450-264a-4988-a1e4-db298b9831aa", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "a5a1cd" },
    body: JSON.stringify({
      sessionId: "a5a1cd",
      hypothesisId,
      location,
      message,
      data,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
}

export function gtDomSnapshot() {
  if (typeof document === "undefined") return { fontCount: 0, translated: false, gtLang: "en" };
  return {
    fontCount: document.querySelectorAll("font").length,
    highlightCount: document.querySelectorAll(".goog-text-highlight").length,
    translatedLtr: document.documentElement.classList.contains("translated-ltr"),
    translatedRtl: document.documentElement.classList.contains("translated-rtl"),
    pathname: window.location.pathname,
  };
}
