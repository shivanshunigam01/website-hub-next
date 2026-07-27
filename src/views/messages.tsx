"use client";

import { Link, useSearch } from "@/lib/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Send, Search, ArrowLeft, Lock, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useApp } from "@/hooks/use-app";
import { cn } from "@/lib/utils";
import { AppImage } from "@/components/AppImage";
import { formatApiErrorMessage } from "@/lib/api";
import {
  fetchConversations,
  fetchMessages,
  getOrCreateConversation,
  sendConversationMessage,
  type ChatMessage,
  type Conversation,
} from "@/services/conversations-api";
import { toast } from "sonner";

const POLL_MS = 5000;

function mergeConversation(list: Conversation[], convo: Conversation) {
  const without = list.filter((c) => c.id !== convo.id);
  return [convo, ...without];
}

function Messages() {
  const { tutorId } = useSearch<{ tutorId?: string }>();
  const { user } = useApp();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [active, setActive] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [filter, setFilter] = useState("");
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);
  const [gate, setGate] = useState<{
    messagingLimited?: boolean;
    messagesRemaining?: number | null;
    contactUnlocked?: boolean;
    status?: string;
  }>({});
  const activeIdRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    activeIdRef.current = active?.id ?? null;
  }, [active?.id]);

  const loadList = useCallback(
    async (includeId?: string) => {
      if (!user) return [] as Conversation[];
      setLoadingList(true);
      try {
        const items = await fetchConversations(includeId ? { includeId } : undefined);
        setConversations(items);
        return items;
      } catch (e) {
        toast.error(formatApiErrorMessage(e, "Could not load conversations"));
        return [] as Conversation[];
      } finally {
        setLoadingList(false);
      }
    },
    [user],
  );

  const openThread = useCallback(async (convo: Conversation, opts?: { quiet?: boolean }) => {
    setActive(convo);
    setMobileChatOpen(true);
    if (!opts?.quiet) setLoadingThread(true);
    try {
      const data = await fetchMessages(convo.id);
      if (activeIdRef.current && activeIdRef.current !== convo.id && opts?.quiet) return;
      setMessages(data.items ?? []);
      setGate({
        messagingLimited: data.messagingLimited ?? convo.messagingLimited,
        messagesRemaining: data.messagesRemaining ?? convo.messagesRemaining,
        contactUnlocked: data.contactUnlocked ?? convo.contactUnlocked,
        status: data.connection?.status ?? convo.connectionStatus,
      });
    } catch (e) {
      if (!opts?.quiet) toast.error(formatApiErrorMessage(e, "Could not load messages"));
    } finally {
      if (!opts?.quiet) setLoadingThread(false);
    }
  }, []);

  const refreshThreadQuiet = useCallback(async (conversationId: string) => {
    if (activeIdRef.current !== conversationId) return;
    try {
      const data = await fetchMessages(conversationId);
      if (activeIdRef.current !== conversationId) return;
      setMessages((prev) => {
        const next = data.items ?? [];
        if (prev.length === next.length && prev.every((m, i) => m.id === next[i]?.id)) return prev;
        return next;
      });
      setGate({
        messagingLimited: data.messagingLimited,
        messagesRemaining: data.messagesRemaining,
        contactUnlocked: data.contactUnlocked,
        status: data.connection?.status,
      });
      const last = data.items?.[data.items.length - 1];
      if (last?.text) {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId
              ? { ...c, lastMessage: last.text, updatedAt: last.createdAt }
              : c,
          ),
        );
      }
    } catch {
      /* ignore quiet poll errors */
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    void (async () => {
      if (tutorId) {
        try {
          const convo = await getOrCreateConversation(tutorId, { source: "message" });
          if (cancelled) return;
          const items = await loadList(convo.id);
          if (cancelled) return;
          const found = items.find((c) => c.id === convo.id) || convo;
          setConversations((prev) => mergeConversation(prev.length ? prev : items, found));
          await openThread(found);
        } catch (e) {
          if (!cancelled) toast.error(formatApiErrorMessage(e, "Could not open chat with tutor"));
        }
        return;
      }

      const items = await loadList();
      if (cancelled) return;
      if (items?.length) await openThread(items[0]);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, tutorId, loadList, openThread]);

  // Poll open thread so teacher/student replies appear without refresh
  useEffect(() => {
    if (!user || !active?.id) return;
    const id = active.id;
    const tick = () => {
      if (activeIdRef.current !== id || document.visibilityState === "hidden") return;
      void refreshThreadQuiet(id);
    };
    const timer = window.setInterval(tick, POLL_MS);
    return () => window.clearInterval(timer);
  }, [user, active?.id, refreshThreadQuiet]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, active?.id]);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => {
      const name = c.other?.name?.toLowerCase() ?? "";
      const subject = c.other?.subject?.toLowerCase() ?? "";
      const last = (c.lastMessage || "").toLowerCase();
      return name.includes(q) || subject.includes(q) || last.includes(q);
    });
  }, [conversations, filter]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!active || !draft.trim() || sending) return;
    setSending(true);
    try {
      const msg = await sendConversationMessage(active.id, draft.trim());
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      setDraft("");
      setGate({
        messagingLimited: msg.messagingLimited,
        messagesRemaining: msg.messagesRemaining,
        contactUnlocked: msg.connection?.contactUnlocked,
        status: msg.connection?.status,
      });
      const updated: Conversation = {
        ...active,
        lastMessage: msg.text,
        updatedAt: msg.createdAt,
        messagingLimited: msg.messagingLimited,
        messagesRemaining: msg.messagesRemaining,
        connectionStatus: msg.connection?.status,
      };
      setActive(updated);
      setConversations((prev) => mergeConversation(prev, updated));
    } catch (err) {
      toast.error(formatApiErrorMessage(err, "Could not send message"));
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <section className="container mx-auto px-4 py-6">
        <h1 className="mb-4 font-display text-2xl font-extrabold">Messages</h1>
        <p className="text-sm text-muted-foreground">
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>{" "}
          to message tutors.
        </p>
      </section>
    );
  }

  if (loadingList && !active) {
    return (
      <section className="container mx-auto flex min-h-[40vh] items-center justify-center px-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </section>
    );
  }

  if (!active && !loadingList) {
    return (
      <section className="container mx-auto px-4 py-6">
        <h1 className="mb-4 font-display text-2xl font-extrabold">Messages</h1>
        <p className="text-sm text-muted-foreground">
          No active chats yet.{" "}
          <Link to="/tutors" className="font-semibold text-primary hover:underline">
            Browse tutors
          </Link>{" "}
          and tap <strong>Message</strong> on a tutor you want to talk to.
        </p>
      </section>
    );
  }

  if (!active) return null;

  const other = active.other;
  const isLearner = user.role === "student" || user.role === "parent";
  const locked = isLearner && gate.messagingLimited && (gate.messagesRemaining ?? 0) <= 0;

  return (
    <section className="container mx-auto px-4 py-6">
      <h1 className="mb-4 font-display text-2xl font-extrabold md:block">Messages</h1>
      <div
        className={cn(
          "grid overflow-hidden rounded-2xl border bg-card",
          "h-[min(70dvh,calc(100dvh-10rem))] md:h-[70vh] md:grid-cols-[minmax(0,300px)_1fr]",
        )}
      >
        <aside
          className={cn(
            "min-h-0 overflow-y-auto border-r",
            mobileChatOpen ? "hidden md:block" : "block",
          )}
        >
          <div className="border-b p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search chats…"
                className="pl-10"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
          </div>
          {filtered.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No matching chats.</p>
          ) : (
            filtered.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => void openThread(c)}
                className={cn(
                  "flex w-full items-center gap-3 p-3 text-left hover:bg-muted/40",
                  active.id === c.id && "bg-muted/50",
                )}
              >
                <AppImage
                  src={c.other?.avatarUrl || ""}
                  alt=""
                  width={40}
                  height={40}
                  sizes="40px"
                  className="h-10 w-10 shrink-0 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{c.other?.name || "Chat"}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {c.lastMessage ||
                      c.other?.subject ||
                      (c.connectionStatus === "pending" ? "Connection pending" : "New conversation")}
                  </div>
                </div>
              </button>
            ))
          )}
        </aside>
        <div className={cn("flex min-h-0 flex-col", !mobileChatOpen && "hidden md:flex")}>
          <div className="flex items-center gap-3 border-b p-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 md:hidden"
              aria-label="Back to conversations"
              onClick={() => setMobileChatOpen(false)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <AppImage
              src={other?.avatarUrl || ""}
              alt=""
              width={36}
              height={36}
              sizes="36px"
              className="h-9 w-9 shrink-0 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{other?.name}</div>
              <div className="text-xs text-muted-foreground">
                {gate.contactUnlocked
                  ? "● Full access"
                  : gate.status === "approved"
                    ? "● Approved — pay to unlock"
                    : gate.status === "pending"
                      ? `● Pending admin · ${gate.messagesRemaining ?? 0} msgs left`
                      : other?.subject
                        ? `● ${other.subject}`
                        : "● Ready to chat"}
              </div>
            </div>
            {other?.id && other.role === "teacher" && (
              <Button asChild size="sm" variant="outline" className="ms-auto shrink-0">
                <Link to="/tutors/$id" params={{ id: other.id }}>
                  View profile
                </Link>
              </Button>
            )}
          </div>

          {isLearner && gate.messagingLimited && (
            <div className="flex items-start gap-2 border-b bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
              <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                Limited to 2 messages until admin approves and you pay the tutor fee. Phone stays
                masked until then.
                {typeof gate.messagesRemaining === "number"
                  ? ` ${gate.messagesRemaining} remaining.`
                  : ""}
              </span>
            </div>
          )}

          <div className="flex-1 space-y-3 overflow-y-auto bg-muted/20 p-4">
            {loadingThread ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : messages.length === 0 ? (
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm border bg-card p-3 text-sm sm:max-w-[75%]">
                {isLearner
                  ? `Hi! I'm ${other?.name || "your tutor"}. Send a message to discuss your learning goals or book a session.`
                  : "No messages yet — reply when the learner reaches out."}
              </div>
            ) : (
              messages.map((m) => {
                const mine = m.senderId === user.id;
                return (
                  <div
                    key={m.id}
                    className={cn(
                      "max-w-[85%] rounded-2xl border p-3 text-sm sm:max-w-[75%]",
                      mine
                        ? "ms-auto rounded-tr-sm bg-primary text-primary-foreground"
                        : "rounded-tl-sm bg-card",
                    )}
                  >
                    {m.text}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
          <form className="flex gap-2 border-t bg-card p-3" onSubmit={(e) => void handleSend(e)}>
            <Input
              placeholder={locked ? "Unlock chat by paying after admin approval…" : "Type a message…"}
              className="min-w-0 flex-1"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              disabled={locked || sending}
            />
            <Button
              type="submit"
              size="icon"
              variant="gradient"
              className="shrink-0"
              disabled={locked || sending || !draft.trim()}
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Messages;
