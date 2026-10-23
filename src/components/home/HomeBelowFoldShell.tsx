import type { ReactNode } from "react";

/** Below-fold wrapper — no artificial min-height; sections own their layout shells. */
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
