"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveConnectionAdmin,
  fetchAdminConnection,
  fetchAdminConnections,
  fetchConnectionByTeacher,
  fetchMyConnections,
  rejectConnectionAdmin,
  requestTutorConnection,
} from "@/services/connections-api";

export function useMyConnections(enabled = true) {
  return useQuery({
    queryKey: ["my-connections"],
    queryFn: fetchMyConnections,
    enabled,
    refetchInterval: 15000,
  });
}

export function useConnectionByTeacher(teacherId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ["connection-by-teacher", teacherId],
    queryFn: () => fetchConnectionByTeacher(teacherId!),
    enabled: enabled && !!teacherId,
  });
}

export function useRequestTutorConnection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: requestTutorConnection,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["my-connections"] });
      qc.invalidateQueries({ queryKey: ["connection-by-teacher", data.teacherId] });
      qc.invalidateQueries({ queryKey: ["admin-connections"] });
    },
  });
}

export function useAdminConnections(status = "pending", q = "") {
  return useQuery({
    queryKey: ["admin-connections", status, q],
    queryFn: async () => {
      const data = await fetchAdminConnections(status, q);
      return data.items ?? [];
    },
    refetchInterval: 8000,
  });
}

export function useAdminConnectionDetail(id: string | null) {
  return useQuery({
    queryKey: ["admin-connection", id],
    queryFn: () => fetchAdminConnection(id!),
    enabled: !!id,
    refetchInterval: id ? 5000 : false,
  });
}

export function useApproveConnectionAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, adminRemark }: { id: string; adminRemark?: string }) =>
      approveConnectionAdmin(id, adminRemark),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-connections"] });
      qc.invalidateQueries({ queryKey: ["my-connections"] });
    },
  });
}

export function useRejectConnectionAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, adminRemark }: { id: string; adminRemark: string }) =>
      rejectConnectionAdmin(id, adminRemark),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-connections"] });
      qc.invalidateQueries({ queryKey: ["my-connections"] });
    },
  });
}
