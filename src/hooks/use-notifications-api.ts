"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchMyNotifications, markNotificationRead } from "@/services/notifications-api";

export function useMyNotifications(enabled = true, limit = 20) {
  return useQuery({
    queryKey: ["my-notifications", limit],
    queryFn: () => fetchMyNotifications(limit),
    enabled,
    refetchInterval: 20000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-notifications"] });
    },
  });
}
