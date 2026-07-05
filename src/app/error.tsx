"use client";

import { useEffect } from "react";
import { debugGtLog, gtDomSnapshot } from "@/lib/debug-gt-log";
import { isGoogleTranslateActive } from "@/lib/google-translate";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isDomSyncError =
    error.name === "NotFoundError" &&
    /removeChild|insertBefore|not a child/i.test(error.message);

  useEffect(() => {
    console.error(error);
    debugGtLog("A", "error.tsx:GlobalError", "react error boundary caught", {
      errorName: error.name,
      errorMessage: error.message,
      isDomSyncError,
      gtActive: isGoogleTranslateActive(),
      ...gtDomSnapshot(),
      stack: error.stack?.slice(0, 300),
    });
  }, [error, isDomSyncError]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isDomSyncError
            ? "The page was updating while translation was active. Reload to continue."
            : error.message}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {isDomSyncError ? (
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Reload page
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
