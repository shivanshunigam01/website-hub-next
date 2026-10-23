"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchHomeCatalog } from "@/hooks/use-catalog";

/** Starts course/tutor API fetch immediately on the homepage (before below-fold sections mount). */
export function HomeCatalogPrefetch() {
  const queryClient = useQueryClient();

  useEffect(() => {
    prefetchHomeCatalog(queryClient);
  }, [queryClient]);

  return null;
}
