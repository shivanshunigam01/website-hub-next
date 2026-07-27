"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Handshake } from "lucide-react";
import { Link } from "@/lib/navigation";
import { useMyConnections } from "@/hooks/use-connections-api";
import { formatPrice } from "@/lib/currencies";

const STATUS_CLASS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  approved: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
  connected: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

export function TeacherConnectionsPanel() {
  const { data: items = [], isLoading } = useMyConnections(true);

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-2xl border bg-card p-5 text-sm text-muted-foreground">
        <Handshake className="mb-2 h-5 w-5 text-primary" />
        No connection requests yet. When a student or parent wants to message, call, or hire you,
        their request appears here (and with admin) after they select you.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((c) => (
        <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4">
          <div className="min-w-0">
            <div className="font-semibold">{c.learnerName}</div>
            <div className="text-xs capitalize text-muted-foreground">
              {c.learnerRole} · via {c.source || "message"} · {c.learnerMessageCount ?? 0} learner msgs
            </div>
            {c.amount ? (
              <div className="mt-1 text-xs text-muted-foreground">
                Fee: {formatPrice(c.amount, c.currency || "INR")}
              </div>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <Badge className={STATUS_CLASS[c.status] || ""} variant="outline">
              {c.status}
            </Badge>
            {c.conversationId && (
              <Button asChild size="sm" variant="outline">
                <Link to="/messages">Open chat</Link>
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
