/** Debug instrumentation — disabled in production (was calling 127.0.0.1:7651). */
export function debugGtLog(
  _hypothesisId: string,
  _location: string,
  _message: string,
  _data?: Record<string, unknown>,
) {
  if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_DEBUG_GT === "true") {
    // Optional local ingest — never run in production builds.
    fetch("http://127.0.0.1:7651/ingest/ed07b450-264a-4988-a1e4-db298b9831aa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: _message, data: _data, timestamp: Date.now() }),
    }).catch(() => {});
  }
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
