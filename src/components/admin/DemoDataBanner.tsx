"use client";

import { AlertTriangle } from "lucide-react";

/** Shown on admin tabs that still use local demo store — not persisted to the API. */
export function DemoDataBanner({ feature }: { feature: string }) {
  return (
    <div className="mb-4 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <p>
        <span className="font-semibold">{feature}</span> on this tab is demo/local data only and is{" "}
        <strong>not saved to production</strong>. Use API-backed panels (Connections, Job Applications,
        Requirements, Workshops, Tickets, etc.) for live operations.
      </p>
    </div>
  );
}
