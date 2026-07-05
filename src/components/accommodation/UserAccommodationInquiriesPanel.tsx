"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@/lib/navigation";
import { Building2, Loader2, MessageSquare, Send, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatApiErrorMessage } from "@/lib/api";
import {
  useInquiryDetail,
  useMyAccommodationInquiries,
  useSendInquiryMessage,
} from "@/hooks/use-accommodation-inquiry";
import type { AccommodationInquiryThread } from "@/services/accommodation-inquiry-api";
import { toast } from "sonner";

function ThreadListItem({
  item,
  active,
  onClick,
}: {
  item: AccommodationInquiryThread;
  active: boolean;
  onClick: () => void;
}) {
  const lastMsg = item.messages?.[item.messages.length - 1];
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
          <p className="truncate text-sm font-semibold">{item.accommodationName || "Accommodation"}</p>
          <p className="truncate text-xs text-muted-foreground">
            {[item.city, item.country].filter(Boolean).join(", ") || "Location TBD"}
          </p>
        </div>
        <Badge variant={item.status === "closed" ? "secondary" : "default"} className="shrink-0 capitalize">
          {item.status}
        </Badge>
      </div>
      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
        {lastMsg?.body ?? item.message ?? "No messages yet"}
      </p>
    </button>
  );
}

export function UserAccommodationInquiriesPanel() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const scrollerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useMyAccommodationInquiries();
  const items = data?.items ?? [];

  useEffect(() => {
    if (!selectedId && items.length > 0) setSelectedId(items[0].id);
  }, [items, selectedId]);

  const { data: thread, isLoading: loadingThread } = useInquiryDetail(selectedId);
  const sendMutation = useSendInquiryMessage(thread?.accommodationId ?? "");

  const messages = useMemo(() => thread?.messages ?? [], [thread?.messages]);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, selectedId]);

  async function sendReply() {
    if (!thread || !reply.trim()) return;
    try {
      await sendMutation.mutateAsync({
        body: reply.trim(),
        accommodationName: thread.accommodationName,
        city: thread.city,
        country: thread.country,
      });
      setReply("");
    } catch (err) {
      toast.error(formatApiErrorMessage(err, "Could not send message"));
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-12 text-center">
        <Building2 className="mx-auto h-10 w-10 text-muted-foreground/40" />
        <h3 className="mt-4 font-display text-lg font-bold">No accommodation enquiries yet</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Browse PGs and hostels, tap <strong>Enquire</strong> on a listing, and your chat with our team will appear
          here.
        </p>
        <Button asChild className="mt-5" variant="outline">
          <Link to="/accommodation">Browse accommodation →</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(240px,320px)_1fr]">
      <div className="max-h-[32rem] space-y-2 overflow-y-auto pe-1">
        {items.map((item) => (
          <ThreadListItem
            key={item.id}
            item={item}
            active={item.id === selectedId}
            onClick={() => setSelectedId(item.id)}
          />
        ))}
      </div>

      <div className="flex min-h-[32rem] flex-col overflow-hidden rounded-2xl border bg-card">
        {!selectedId || !thread ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-muted-foreground">
            <MessageSquare className="h-8 w-8" />
            <p className="text-sm">Select a conversation</p>
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
                  <p className="font-semibold">{thread.accommodationName}</p>
                  <p className="text-xs text-muted-foreground">
                    {[thread.city, thread.country].filter(Boolean).join(", ")}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <ShieldCheck className="h-3 w-3 text-emerald-600" />
                    Chat with TeacherPoint support
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Badge variant={thread.status === "closed" ? "secondary" : "default"} className="capitalize">
                    {thread.status}
                  </Badge>
                  <Link
                    to="/accommodation"
                    search={{ enquiry: thread.accommodationId }}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    View listing →
                  </Link>
                </div>
              </div>
            </div>

            <div
              ref={scrollerRef}
              className="flex-1 space-y-2 overflow-y-auto bg-[radial-gradient(circle_at_1px_1px,hsl(var(--muted-foreground)/0.07)_1px,transparent_0)] bg-[size:18px_18px] px-4 py-4"
            >
              {messages.map((m) => {
                const fromSupport = m.authorRole === "admin";
                return (
                  <div key={m.id ?? m.createdAt} className={`flex ${fromSupport ? "justify-start" : "justify-end"}`}>
                    <div
                      className={`max-w-[82%] rounded-2xl px-3.5 py-2 text-sm shadow-sm ${
                        fromSupport
                          ? "rounded-bl-md border bg-card"
                          : "rounded-br-md bg-primary text-primary-foreground"
                      }`}
                    >
                      {fromSupport ? (
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          TeacherPoint
                        </p>
                      ) : null}
                      <p className="whitespace-pre-wrap leading-snug">{m.body}</p>
                      <p
                        className={`mt-1 text-[10px] ${
                          fromSupport ? "text-muted-foreground" : "text-primary-foreground/70"
                        }`}
                      >
                        {new Date(m.createdAt).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {thread.status === "closed" ? (
              <div className="border-t bg-muted/40 px-4 py-3 text-center text-sm text-muted-foreground">
                This enquiry is closed.{" "}
                <Link to="/accommodation" className="font-medium text-primary hover:underline">
                  Browse other listings
                </Link>
              </div>
            ) : (
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
                  placeholder="Type a message…"
                  maxLength={2000}
                  disabled={sendMutation.isPending}
                />
                <Button type="submit" size="icon" disabled={!reply.trim() || sendMutation.isPending}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
