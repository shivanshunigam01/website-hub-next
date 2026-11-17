"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { HomeBelowFoldPlaceholders } from "@/components/home/HomeBelowFoldPlaceholders";
import { deferUntilIdle } from "@/lib/defer-until-idle";

const HomePage = dynamic(() => import("@/views/index"), {
  ssr: false,
  loading: () => null,
});

/**
 * Home sections in a separate chunk. Desktop mounts immediately; mobile defers with
 * placeholders to limit CLS (no full-page swap on large viewports).
 */
export function HomeBelowFoldMount() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(min-width: 1024px)").matches) {
      setReady(true);
      return;
    }
    deferUntilIdle(() => setReady(true), 2000);
  }, []);

  if (!ready) {
    return (
      <div className="max-lg:block lg:hidden" aria-hidden>
        <HomeBelowFoldPlaceholders />
      </div>
    );
  }

  return <HomePage />;
}
