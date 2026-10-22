/** Append a visitor row to the admin demo store in localStorage (no React context). */
const STORE_KEY = "tp_admin_store_v4";

type VisitorPayload = {
  ip?: string;
  country?: string;
  countryCode?: string;
  city?: string;
  language?: string;
  path?: string;
  referrer?: string;
  userAgent?: string;
};

function rid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function recordVisitorSession(entry: VisitorPayload) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return;
    const state = JSON.parse(raw) as { visitors?: unknown[] };
    const visitors = Array.isArray(state.visitors) ? state.visitors : [];
    const next = {
      ...state,
      visitors: [
        { id: rid("v"), visitedAt: new Date().toISOString(), ...entry },
        ...visitors,
      ].slice(0, 500),
    };
    localStorage.setItem(STORE_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota / parse errors */
  }
}
