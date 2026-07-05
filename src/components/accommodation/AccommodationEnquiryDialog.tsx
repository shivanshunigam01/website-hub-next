"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@/lib/navigation";
import { Check, CheckCheck, LogIn, Send, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/hooks/use-app";
import type { Accommodation } from "@/hooks/use-admin-store";
import {
  useAccommodationInquiry,
  useSendInquiryMessage,
} from "@/hooks/use-accommodation-inquiry";
import type { InquiryMessage } from "@/services/accommodation-inquiry-api";
import {
  buildEnquiryReturnPath,
  clearPendingEnquiry,
  readPendingEnquiry,
  savePendingEnquiry,
} from "@/lib/accommodation-enquiry-pending";
import { formatApiErrorMessage } from "@/lib/api";
import { toast } from "sonner";

const QUICK_REPLIES = [
  "Is it still available?",
  "Can I schedule a visit?",
  "Is the price negotiable?",
  "What's the deposit?",
  "Are meals included?",
];

function isEnquiryRole(role: string | null | undefined) {
  return role === "student" || role === "teacher";
}

type UiMessage = {
  id: string;
  from: "me" | "support";
  text: string;
  at: number;
  read?: boolean;
};

function mapMessages(messages: InquiryMessage[] | undefined, userId?: string): UiMessage[] {
  return (messages ?? []).map((m) => ({
    id: m.id ?? `${m.createdAt}-${m.body.slice(0, 12)}`,
    from:
      m.authorRole === "admin" || m.authorId !== userId
        ? ("support" as const)
        : ("me" as const),
    text: m.body,
    at: new Date(m.createdAt).getTime(),
    read: true,
  }));
}

type Props = {
  accommodation: Accommodation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AccommodationEnquiryDialog({ accommodation, open, onOpenChange }: Props) {
  const { user, role } = useApp();
  const loggedIn = isEnquiryRole(role);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState("");
  const [localOnly, setLocalOnly] = useState<UiMessage[]>([]);
  const [sending, setSending] = useState(false);
  const resumedRef = useRef(false);

  const accommodationId = accommodation?.id ?? "";
  const { data: thread, refetch } = useAccommodationInquiry(accommodationId, open, loggedIn);
  const sendMutation = useSendInquiryMessage(accommodationId);

  const apiMessages = useMemo(
    () => mapMessages(thread?.messages, user?.id),
    [thread?.messages, user?.id],
  );

  const welcomeMessage = useMemo((): UiMessage | null => {
    if (!accommodation) return null;
    return {
      id: "welcome",
      from: "support",
      text: `Hi 👋 Thanks for your interest in ${accommodation.name}. Message us here about availability, rent, or visit timings — our team will reply shortly.`,
      at: Date.now() - 60_000,
      read: true,
    };
  }, [accommodation]);

  const displayMessages = useMemo(() => {
    const base = loggedIn && apiMessages.length > 0 ? apiMessages : localOnly;
    if (base.length === 0 && welcomeMessage) return [welcomeMessage];
    if (base.length > 0 && welcomeMessage && !loggedIn) return [welcomeMessage, ...base];
    return base.length > 0 ? base : welcomeMessage ? [welcomeMessage] : [];
  }, [apiMessages, localOnly, welcomeMessage, loggedIn]);

  const returnPath = accommodation ? buildEnquiryReturnPath(accommodation.id) : "/accommodation";

  useEffect(() => {
    if (!open || !accommodation) return;
    inputRef.current?.focus();
  }, [open, accommodation?.id]);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [displayMessages, open]);

  useEffect(() => {
    if (!open || !accommodation || !loggedIn || resumedRef.current) return;

    const pending = readPendingEnquiry();
    if (!pending || pending.accommodationId !== accommodation.id) return;

    resumedRef.current = true;
    const draft = pending.draftMessage?.trim();
    clearPendingEnquiry();

    if (!draft) return;

    void (async () => {
      try {
        await sendMutation.mutateAsync({
          body: draft,
          accommodationName: accommodation.name,
          city: accommodation.city,
          country: accommodation.country,
        });
        setInput("");
        setLocalOnly([]);
        await refetch();
      } catch (err) {
        toast.error(formatApiErrorMessage(err, "Could not send your message"));
        setInput(draft);
      }
    })();
  }, [open, accommodation, loggedIn, sendMutation, refetch]);

  useEffect(() => {
    if (!open) resumedRef.current = false;
  }, [open]);

  if (!accommodation) return null;

  const handleSend = async (raw: string) => {
    const text = raw.trim();
    if (!text) return;

    if (!loggedIn) {
      savePendingEnquiry({
        accommodationId: accommodation.id,
        draftMessage: text,
        returnPath,
      });
      setLocalOnly((prev) => [
        ...prev,
        { id: crypto.randomUUID(), from: "me", text, at: Date.now(), read: false },
      ]);
      setInput("");
      return;
    }

    setSending(true);
    try {
      await sendMutation.mutateAsync({
        body: text,
        accommodationName: accommodation.name,
        city: accommodation.city,
        country: accommodation.country,
      });
      setInput("");
      setLocalOnly([]);
      await refetch();
    } catch (err) {
      toast.error(formatApiErrorMessage(err, "Could not send message"));
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="sr-only">
          <DialogTitle>Enquire about {accommodation.name}</DialogTitle>
          <DialogDescription>Chat with the TeacherPoint accommodation team</DialogDescription>
        </DialogHeader>

        <div className="border-b bg-gradient-to-r from-primary/5 to-transparent px-4 py-3">
          <div className="flex items-center gap-3">
            <img
              src={accommodation.imageUrl}
              alt=""
              className="h-12 w-16 shrink-0 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{accommodation.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {accommodation.city}, {accommodation.country} · {accommodation.currency}{" "}
                {accommodation.pricePerMonth.toLocaleString()}/mo
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                <ShieldCheck className="h-3 w-3 text-emerald-600" />
                Verified listing · TeacherPoint support
              </p>
            </div>
          </div>
        </div>

        <div
          ref={scrollerRef}
          className="min-h-[20rem] flex-1 space-y-2.5 overflow-y-auto bg-[radial-gradient(circle_at_1px_1px,hsl(var(--muted-foreground)/0.07)_1px,transparent_0)] bg-[size:18px_18px] px-4 py-4"
        >
          {displayMessages.map((m) => (
            <div key={m.id} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[82%] rounded-2xl px-3.5 py-2 text-sm shadow-sm ${
                  m.from === "me"
                    ? "rounded-br-md bg-primary text-primary-foreground"
                    : "rounded-bl-md border bg-card"
                }`}
              >
                {m.from === "support" ? (
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    TeacherPoint
                  </p>
                ) : null}
                <p className="whitespace-pre-wrap leading-snug">{m.text}</p>
                <div
                  className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                    m.from === "me" ? "text-primary-foreground/70" : "text-muted-foreground"
                  }`}
                >
                  {new Date(m.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  {m.from === "me" &&
                    (m.read ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {!loggedIn ? (
          <div className="border-t bg-muted/40 px-4 py-3">
            <p className="text-sm font-medium">Sign in to continue this chat</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Log in as a <strong>student</strong> or <strong>teacher</strong> so we can save your messages and
              reply to you here.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button asChild size="sm">
                <Link to="/login" search={{ redirect: returnPath }}>
                  <LogIn className="mr-1.5 h-3.5 w-3.5" />
                  Log in to continue
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to="/register">Create account</Link>
              </Button>
            </div>
          </div>
        ) : null}

        <div className="flex gap-2 overflow-x-auto border-t bg-card px-4 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {QUICK_REPLIES.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => void handleSend(q)}
              disabled={sending}
              className="shrink-0 rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground transition hover:border-primary hover:text-primary disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSend(input);
          }}
          className="flex items-center gap-2 border-t bg-card px-3 py-2.5"
        >
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={loggedIn ? "Type a message…" : "Type a message — login required to send"}
            maxLength={500}
            className="flex-1"
            disabled={sending}
          />
          <Button type="submit" size="icon" disabled={!input.trim() || sending} aria-label="Send">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
