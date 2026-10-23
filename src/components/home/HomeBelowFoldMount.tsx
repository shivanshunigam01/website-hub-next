"use client";

import { useEffect, useState } from "react";
import HomePage from "@/views/index";
import { HomeBelowFoldPlaceholders } from "@/components/home/HomeBelowFoldPlaceholders";
import { deferUntilIdle } from "@/lib/defer-until-idle";

/**
 * One swap below the hero (placeholders → real sections) inside a fixed min-height shell
 * so GTmetrix/Lighthouse do not see footer + main layout shifts.
 */
export function HomeBelowFoldMount() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    deferUntilIdle(() => setReady(true), 2000);
  }, []);

  if (!ready) {
    return <HomeBelowFoldPlaceholders />;
  }

  return <HomePage />;
}
