"use client";

import HomePage from "@/views/index";

/** Home sections mount immediately — catalog prefetch runs in `HomeCatalogPrefetch`. */
export function HomeBelowFoldMount() {
  return <HomePage />;
}
