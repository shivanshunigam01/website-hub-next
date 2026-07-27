import { api } from "@/lib/api";

export type AppNotification = {
  id: string;
  userId?: string;
  title: string;
  body: string;
  type?: string;
  read?: boolean;
  unread?: boolean;
  link?: string;
  time?: string;
  createdAt?: string;
  metadata?: Record<string, unknown>;
};

function shapeNotification(n: AppNotification): AppNotification {
  const createdAt = n.createdAt;
  let time = n.time;
  if (!time && createdAt) {
    try {
      time = new Date(createdAt).toLocaleString();
    } catch {
      time = createdAt;
    }
  }
  return {
    ...n,
    unread: n.unread ?? !n.read,
    time: time || "",
  };
}

/** @param limitOrOpts number limit (legacy) or options object */
export async function fetchMyNotifications(
  limitOrOpts: number | { read?: boolean; limit?: number } = 30,
) {
  const opts =
    typeof limitOrOpts === "number" ? { limit: limitOrOpts } : limitOrOpts || {};
  const sp = new URLSearchParams();
  if (opts.read === true) sp.set("read", "true");
  if (opts.read === false) sp.set("read", "false");
  sp.set("limit", String(opts.limit ?? 30));
  const data = await api<{ items: AppNotification[] }>(`/notifications/me?${sp}`);
  return (data.items ?? []).map(shapeNotification);
}

export async function markNotificationRead(id: string) {
  const n = await api<AppNotification>(`/notifications/${id}/read`, { method: "PATCH" });
  return shapeNotification(n);
}

export async function sendBroadcastNotification(input: {
  title: string;
  body: string;
  audience: "all" | "students" | "teachers" | "parents" | "admins";
  type?: string;
  link?: string;
}) {
  return api<{ created: number; audience?: string }>("/notifications", {
    method: "POST",
    body: JSON.stringify({
      title: input.title,
      subject: input.title,
      body: input.body,
      audience: input.audience,
      type: input.type || "system",
      link: input.link,
    }),
  });
}
