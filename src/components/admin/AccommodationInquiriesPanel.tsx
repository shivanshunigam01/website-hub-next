"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Mail, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatApiErrorMessage } from "@/lib/api";
import {
  useAdminInquiries,
  useAdminInquiryDetail,
  useAdminInquiryReply,
  useAdminInquiryStatus,
} from "@/hooks/use-accommodation-inquiry";
import type { AccommodationInquiryThread } from "@/services/accommodation-inquiry-api";
import { toast } from "sonner";

function InquiryListItem({
  item,
  active,
  onClick,
}: {
  item: AccommodationInquiryThread;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl border p-3 text-left transition ${
        active ? "border-primary bg-primary/5" : "bg-card hover:border-primary/40"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{item.studentName || item.email || "Student"}</p>
          <p className="truncate text-xs text-muted-foreground">{item.accommodationName || "Accommodation"}</p>
        </div>
        <Badge variant={item.status === "new" ? "default" : "secondary"} className="shrink-0 capitalize">
          {item.status}
        </Badge>
      </div>
      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.message}</p>
    </button>
  );
}

export function AccommodationInquiriesPanel() {
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQ(q), 300);
    return () => window.clearTimeout(t);
  }, [q]);

  const { data, isLoading } = useAdminInquiries(status, debouncedQ);
  const items = data?.items ?? [];

  useEffect(() => {
    if (!selectedId && items.length > 0) setSelectedId(items[0].id);
  }, [items, selectedId]);

  const { data: thread, isLoading: loadingThread } = useAdminInquiryDetail(selectedId);
  const replyMutation = useAdminInquiryReply();
  const statusMutation = useAdminInquiryStatus();

  const messages = useMemo(() => thread?.messages ?? [], [thread?.messages]);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, selectedId]);

  async function sendReply() {
    if (!selectedId || !reply.trim()) return;
    try {
      await replyMutation.mutateAsync({ id: selectedId, body: reply.trim() });
      setReply("");
      toast.success("Reply sent");
    } catch (err) {
      toast.error(formatApiErrorMessage(err, "Could not send reply"));
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-bold flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          Accommodation enquiries
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Reply to student and teacher messages about PGs and hostels — replies appear in their chat instantly.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, email, listing…"
          className="max-w-sm flex-1"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(240px,320px)_1fr]">
        <div className="space-y-2 max-h-[32rem] overflow-y-auto pe-1">
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">
              <Loader2 className="mx-auto h-5 w-5 animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">No enquiries yet.</p>
          ) : (
            items.map((item) => (
              <InquiryListItem
                key={item.id}
                item={item}
                active={item.id === selectedId}
                onClick={() => setSelectedId(item.id)}
              />
            ))
          )}
        </div>

        <div className="flex min-h-[32rem] flex-col overflow-hidden rounded-2xl border bg-card">
          {!selectedId || !thread ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-muted-foreground">
              <MessageSquare className="h-8 w-8" />
              <p className="text-sm">Select an enquiry to view the conversation</p>
            </div>
          ) : loadingThread ? (
            <div className="flex flex-1 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="border-b px-4 py-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{thread.studentName}</p>
                    <p className="text-xs text-muted-foreground">{thread.email}</p>
                    <p className="mt-1 text-sm">{thread.accommodationName}</p>
                    <p className="text-xs text-muted-foreground">
                      {[thread.city, thread.country].filter(Boolean).join(", ")}
                    </p>
                  </div>
                  <Select
                    value={thread.status}
                    onValueChange={(v) =>
                      void statusMutation.mutateAsync({
                        id: thread.id,
                        status: v as AccommodationInquiryThread["status"],
                      })
                    }
                  >
                    <SelectTrigger className="h-8 w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div ref={scrollerRef} className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
                {messages.map((m) => {
                  const isAdmin = m.authorRole === "admin";
                  return (
                    <div key={m.id ?? m.createdAt} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                          isAdmin
                            ? "rounded-br-md bg-primary text-primary-foreground"
                            : "rounded-bl-md border bg-muted/30"
                        }`}
                      >
                        <p className="mb-0.5 text-[10px] font-semibold uppercase opacity-70">
                          {isAdmin ? "You (Admin)" : m.authorRole}
                        </p>
                        <p className="whitespace-pre-wrap">{m.body}</p>
                        <p className="mt-1 text-[10px] opacity-70">
                          {new Date(m.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <form
                className="flex items-center gap-2 border-t px-3 py-2.5"
                onSubmit={(e) => {
                  e.preventDefault();
                  void sendReply();
                }}
              >
                <Input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type your reply…"
                  maxLength={2000}
                  disabled={thread.status === "closed" || replyMutation.isPending}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!reply.trim() || thread.status === "closed" || replyMutation.isPending}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
