import type { ReactNode } from "react";

/** Reserves below-fold height in static HTML so the footer does not jump before home sections hydrate. */
export function HomeBelowFoldShell({ children }: { children: ReactNode }) {
  return (
    <div className="home-below-fold min-h-[3200px] w-full max-w-full" data-home-below-fold>
      {children}
    </div>
  );
}
