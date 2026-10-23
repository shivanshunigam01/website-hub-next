/** Run work after first paint / load — reduces CLS and TBT from i18n, geo, and widgets. */
export function deferUntilIdle(fn: () => void, timeoutMs = 5000) {
  if (typeof window === "undefined") return;

  const run = () => {
    try {
      fn();
    } catch {
      /* ignore */
    }
  };

  const afterLoad = () => {
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(run, { timeout: timeoutMs });
    } else {
      window.setTimeout(run, Math.min(timeoutMs, 2500));
    }
  };

  if (document.readyState === "complete") {
    afterLoad();
  } else {
    window.addEventListener("load", afterLoad, { once: true });
  }
}
