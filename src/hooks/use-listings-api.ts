"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createListing, fetchMyListings, type ApiListing } from "@/services/listings-api";

export function useMyListings(enabled = true) {
  return useQuery({
    queryKey: ["my-listings"],
    queryFn: fetchMyListings,
    enabled,
  });
}

export function useCreateListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createListing,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-listings"] });
    },
  });
}

export type { ApiListing };
