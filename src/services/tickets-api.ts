import { api } from "@/lib/api";

export type SupportTicket = {
  id: string;
  ticketNumber?: string;
  subject: string;
  description?: string;
  priority: string;
  status: string;
  category?: string;
  requesterName?: string;
  requesterEmail?: string;
  userId?: string;
  messages: {
    id?: string;
    authorId?: string;
    authorRole?: string;
    body?: string;
    message?: string;
    createdAt?: string;
  }[];
  createdAt?: string;
  updatedAt?: string;
};

export async function fetchTickets(params?: { status?: string; q?: string }) {
  const sp = new URLSearchParams();
  if (params?.status) sp.set("status", params.status);
  if (params?.q) sp.set("q", params.q);
  sp.set("limit", "50");
  const qs = sp.toString();
  const data = await api<{ items: SupportTicket[] }>(`/tickets${qs ? `?${qs}` : ""}`);
  return data.items ?? [];
}

export async function fetchTicket(id: string) {
  return api<SupportTicket>(`/tickets/${id}`);
}

export async function createTicket(input: {
  subject: string;
  description: string;
  priority?: string;
  category?: string;
  requesterName?: string;
  requesterEmail?: string;
}) {
  return api<SupportTicket>("/tickets", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateTicket(id: string, patch: { status?: string; priority?: string; subject?: string }) {
  return api<SupportTicket>(`/tickets/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export async function replyTicket(id: string, message: string) {
  return api<SupportTicket>(`/tickets/${id}/messages`, {
    method: "POST",
    body: JSON.stringify({ body: message }),
  });
}
