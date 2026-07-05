import { api } from "@/lib/api";

export type InquiryMessage = {
  id?: string;
  authorId?: string;
  authorRole: "student" | "teacher" | "admin";
  body: string;
  createdAt: string;
};

export type AccommodationInquiryThread = {
  id: string;
  accommodationId: string;
  accommodationName?: string;
  studentName?: string;
  email?: string;
  phone?: string;
  city?: string;
  country?: string;
  message?: string;
  messages: InquiryMessage[];
  status: "new" | "contacted" | "closed";
  userId?: string;
  createdAt: string;
  updatedAt: string;
};

type PaginatedInquiries = {
  items: AccommodationInquiryThread[];
  pagination?: { total: number; page: number; limit: number };
};

export async function fetchMyInquiries(): Promise<{ items: AccommodationInquiryThread[] }> {
  return api<{ items: AccommodationInquiryThread[] }>("/accommodation-inquiries/me");
}

export async function fetchInquiryById(id: string): Promise<AccommodationInquiryThread> {
  return api<AccommodationInquiryThread>(`/accommodation-inquiries/${encodeURIComponent(id)}`);
}

export async function fetchInquiryByAccommodation(
  accommodationId: string,
): Promise<AccommodationInquiryThread | null> {
  return api<AccommodationInquiryThread | null>(
    `/accommodation-inquiries/by-accommodation/${encodeURIComponent(accommodationId)}`,
  );
}

export async function sendInquiryMessage(
  accommodationId: string,
  body: string,
  meta?: { accommodationName?: string; city?: string; country?: string },
): Promise<AccommodationInquiryThread> {
  return api<AccommodationInquiryThread>(
    `/accommodation-inquiries/by-accommodation/${encodeURIComponent(accommodationId)}/messages`,
    {
      method: "POST",
      body: JSON.stringify({ body, ...meta }),
    },
  );
}

export async function fetchAdminInquiries(params?: {
  status?: string;
  q?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedInquiries> {
  const p = new URLSearchParams();
  if (params?.status) p.set("status", params.status);
  if (params?.q?.trim()) p.set("q", params.q.trim());
  p.set("page", String(params?.page ?? 1));
  p.set("limit", String(params?.limit ?? 50));
  return api<PaginatedInquiries>(`/admin/accommodation-inquiries?${p.toString()}`);
}

export async function fetchAdminInquiry(id: string): Promise<AccommodationInquiryThread> {
  return api<AccommodationInquiryThread>(`/admin/accommodation-inquiries/${id}`);
}

export async function adminReplyToInquiry(
  id: string,
  body: string,
): Promise<AccommodationInquiryThread> {
  return api<AccommodationInquiryThread>(`/admin/accommodation-inquiries/${id}/messages`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
}

export async function adminUpdateInquiryStatus(
  id: string,
  status: AccommodationInquiryThread["status"],
): Promise<AccommodationInquiryThread> {
  return api<AccommodationInquiryThread>(`/admin/accommodation-inquiries/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
