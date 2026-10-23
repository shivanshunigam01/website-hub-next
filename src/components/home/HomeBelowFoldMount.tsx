"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { deferUntilIdle } from "@/lib/defer-until-idle";

/** Home sections in a separate chunk — not parsed until after first paint (lower TBT). */
const HomePage = dynamic(() => import("@/views/index"), {
  ssr: false,
  loading: () => null,
});

/**
 * Below-fold home mounts after idle inside `HomeBelowFoldShell` min-height.
 * No placeholder→content swap (that mismatch caused CLS regressions on GTmetrix / web.dev).
 */
export function HomeBelowFoldMount() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    deferUntilIdle(() => setReady(true), 2200);
  }, []);

  if (!ready) {
    return null;
  }

  return <HomePage />;
}
