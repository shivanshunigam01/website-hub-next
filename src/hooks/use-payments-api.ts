"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchMyPayments, fetchReceivedPayments } from "@/services/payments-api";

export function useMyPayments(enabled = true) {
  return useQuery({
    queryKey: ["my-payments"],
    queryFn: fetchMyPayments,
    enabled,
  });
}

export function useReceivedPayments(enabled = true) {
  return useQuery({
    queryKey: ["received-payments"],
    queryFn: fetchReceivedPayments,
    enabled,
  });
}
