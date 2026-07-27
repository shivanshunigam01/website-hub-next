import { api } from "@/lib/api";
import type { TutorConnection } from "@/services/connections-api";

export type ConversationParticipant = {
  id: string;
  name: string;
  role?: string;
  avatarUrl?: string;
  subject?: string;
};

export type Conversation = {
  id: string;
  participants: ConversationParticipant[];
  other: ConversationParticipant | null;
  lastMessage: string;
  updatedAt?: string;
  createdAt?: string;
  connection?: TutorConnection | null;
  messagingLimited?: boolean;
  messagesRemaining?: number | null;
  maxLimitedMessages?: number;
  contactUnlocked?: boolean;
  connectionStatus?: string;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
  connection?: TutorConnection | null;
  messagesRemaining?: number | null;
  messagingLimited?: boolean;
};

export async function fetchConversations(opts?: { includeId?: string }) {
  const qs = opts?.includeId ? `?include=${encodeURIComponent(opts.includeId)}` : "";
  const data = await api<{ items: Conversation[] }>(`/conversations${qs}`);
  return data.items ?? [];
}

export async function getOrCreateConversation(
  participantId: string,
  opts?: { source?: string; initialMessage?: string },
) {
  return api<Conversation>("/conversations", {
    method: "POST",
    body: JSON.stringify({
      participantId,
      source: opts?.source,
      initialMessage: opts?.initialMessage,
    }),
  });
}

export async function fetchMessages(conversationId: string) {
  return api<{
    items: ChatMessage[];
    connection?: TutorConnection | null;
    messagingLimited?: boolean;
    messagesRemaining?: number | null;
    maxLimitedMessages?: number;
    contactUnlocked?: boolean;
  }>(`/conversations/${conversationId}/messages`);
}

export async function sendConversationMessage(conversationId: string, text: string) {
  return api<ChatMessage>(`/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}
