import type { ReactNode } from "react";

/** Below-fold wrapper — mobile reserves height; desktop relies on section shells. */
export function HomeBelowFoldShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="home-below-fold w-full max-w-full [contain:layout] max-lg:min-h-[3000px]"
      data-home-below-fold
    >
      {children}
    </div>
  );
}
