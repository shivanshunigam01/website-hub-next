import { api } from "@/lib/api";

export type ConnectionStatus = "pending" | "approved" | "connected" | "rejected";

export type TutorConnection = {
  id: string;
  learnerId: string;
  learnerRole?: string;
  learnerName?: string;
  learnerEmail?: string;
  teacherId: string;
  teacherName?: string;
  teacherEmail?: string;
  conversationId?: string | null;
  status: ConnectionStatus;
  source?: string;
  initialMessage?: string;
  adminRemark?: string;
  amount?: number;
  currency?: string;
  learnerMessageCount?: number;
  maxLimitedMessages?: number;
  messagesRemaining?: number | null;
  messagingLimited?: boolean;
  contactUnlocked?: boolean;
  phoneMasked?: string | null;
  phone?: string | null;
  paymentId?: string | null;
  paidAt?: string;
  createdAt?: string;
  updatedAt?: string;
  created?: boolean;
  emailSent?: boolean;
  teacherEmailSent?: boolean;
  learnerEmailSent?: boolean;
  messages?: Array<{
    id: string;
    senderId: string;
    text: string;
    createdAt: string;
  }>;
};

export async function requestTutorConnection(input: {
  teacherId: string;
  source?: "message" | "call" | "hire";
  initialMessage?: string;
}) {
  return api<TutorConnection>("/connections", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function fetchMyConnections() {
  const data = await api<{ items: TutorConnection[] }>("/connections");
  return data.items ?? [];
}

export async function fetchConnectionByTeacher(teacherId: string) {
  return api<TutorConnection | null>(`/connections/by-teacher/${teacherId}`);
}

export async function fetchAdminConnections(status = "pending", q = "") {
  const p = new URLSearchParams();
  if (status) p.set("status", status);
  if (q.trim()) p.set("q", q.trim());
  return api<{ items: TutorConnection[]; pagination?: unknown }>(
    `/admin/connections?${p.toString()}`,
  );
}

export async function fetchAdminConnection(id: string) {
  return api<TutorConnection>(`/admin/connections/${id}`);
}

export async function approveConnectionAdmin(id: string, adminRemark?: string) {
  return api<TutorConnection>(`/admin/connections/${id}/approve`, {
    method: "PATCH",
    body: JSON.stringify({ adminRemark }),
  });
}

export async function rejectConnectionAdmin(id: string, adminRemark: string) {
  return api<TutorConnection>(`/admin/connections/${id}/reject`, {
    method: "PATCH",
    body: JSON.stringify({ adminRemark }),
  });
}
