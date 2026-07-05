"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminReplyToInquiry,
  adminUpdateInquiryStatus,
  fetchAdminInquiries,
  fetchAdminInquiry,
  fetchInquiryByAccommodation,
  fetchInquiryById,
  fetchMyInquiries,
  sendInquiryMessage,
  type AccommodationInquiryThread,
} from "@/services/accommodation-inquiry-api";

export function useMyAccommodationInquiries() {
  return useQuery({
    queryKey: ["my-accommodation-inquiries"],
    queryFn: fetchMyInquiries,
    refetchInterval: 8000,
  });
}

export function useInquiryDetail(id: string | null) {
  return useQuery({
    queryKey: ["accommodation-inquiry-detail", id],
    queryFn: () => fetchInquiryById(id!),
    enabled: !!id,
    refetchInterval: id ? 4000 : false,
  });
}

export function useAccommodationInquiry(
  accommodationId: string | undefined,
  enabled: boolean,
  isLoggedIn: boolean,
) {
  return useQuery({
    queryKey: ["accommodation-inquiry", accommodationId],
    queryFn: () => fetchInquiryByAccommodation(accommodationId!),
    enabled: enabled && isLoggedIn && !!accommodationId,
    refetchInterval: enabled && isLoggedIn ? 4000 : false,
  });
}

export function useSendInquiryMessage(accommodationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      body: string;
      accommodationName?: string;
      city?: string;
      country?: string;
    }) => sendInquiryMessage(accommodationId, payload.body, payload),
    onSuccess: (thread) => {
      queryClient.setQueryData(["accommodation-inquiry", accommodationId], thread);
      queryClient.invalidateQueries({ queryKey: ["my-accommodation-inquiries"] });
      if (thread.id) {
        queryClient.setQueryData(["accommodation-inquiry-detail", thread.id], thread);
      }
    },
  });
}

export function useAdminInquiries(status = "all", q = "") {
  return useQuery({
    queryKey: ["admin-accommodation-inquiries", status, q],
    queryFn: () =>
      fetchAdminInquiries({
        status: status === "all" ? undefined : status,
        q,
        limit: 100,
      }),
    refetchInterval: 8000,
  });
}

export function useAdminInquiryDetail(id: string | null) {
  return useQuery({
    queryKey: ["admin-accommodation-inquiry", id],
    queryFn: () => fetchAdminInquiry(id!),
    enabled: !!id,
    refetchInterval: id ? 4000 : false,
  });
}

export function useAdminInquiryReply() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) => adminReplyToInquiry(id, body),
    onSuccess: (thread) => {
      queryClient.setQueryData(["admin-accommodation-inquiry", thread.id], thread);
      queryClient.invalidateQueries({ queryKey: ["admin-accommodation-inquiries"] });
    },
  });
}

export function useAdminInquiryStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: AccommodationInquiryThread["status"];
    }) => adminUpdateInquiryStatus(id, status),
    onSuccess: (thread) => {
      queryClient.setQueryData(["admin-accommodation-inquiry", thread.id], thread);
      queryClient.invalidateQueries({ queryKey: ["admin-accommodation-inquiries"] });
    },
  });
}
