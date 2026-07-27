"use client";

import { Bell, Loader2 } from "lucide-react";
import { Link } from "@/lib/navigation";
import { useMarkNotificationRead, useMyNotifications } from "@/hooks/use-notifications-api";
import { cn } from "@/lib/utils";

export function NotificationsPanel({ enabled = true }: { enabled?: boolean }) {
  const { data: items = [], isLoading } = useMyNotifications(enabled);
  const markRead = useMarkNotificationRead();

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed bg-muted/20 p-8 text-center text-sm text-muted-foreground">
        <Bell className="mx-auto mb-2 h-8 w-8 opacity-50" />
        No notifications yet. Connection requests, approvals, and platform updates will show here.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card p-5">
      <ul className="space-y-3">
        {items.map((n) => {
          const content = (
            <div className={cn("flex items-start gap-2", n.unread && "font-medium")}>
              {n.unread ? <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" /> : null}
              <div className="min-w-0 flex-1">
                <div>{n.title}</div>
                {n.body ? <div className="mt-0.5 text-xs text-muted-foreground">{n.body}</div> : null}
                <div className="mt-1 text-[11px] text-muted-foreground">{n.time}</div>
              </div>
            </div>
          );

          const onActivate = () => {
            if (n.unread) markRead.mutate(n.id);
          };

          if (n.link?.startsWith("/")) {
            return (
              <li key={n.id} className="border-b pb-3 text-sm last:border-0 last:pb-0">
                <Link to={n.link as "/"} onClick={onActivate} className="block hover:opacity-90">
                  {content}
                </Link>
              </li>
            );
          }

          return (
            <li key={n.id} className="border-b pb-3 text-sm last:border-0 last:pb-0">
              <button type="button" className="w-full text-left" onClick={onActivate}>
                {content}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
