"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Phone, Send, ShieldCheck, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminStore, type Accommodation } from "@/hooks/use-admin-store";

type ChatMsg = {
  id: string;
  from: "me" | "owner";
  text: string;
  at: number;
  read?: boolean;
};

const QUICK_REPLIES = [
  "Is it still available?",
  "Can I schedule a visit?",
  "Is the price negotiable?",
  "Can you share more photos?",
  "What's the deposit?",
  "Are meals included?",
];

const ownerNameFor = (a: Accommodation) => {
  const base = a.name.replace(/\b(PG|Hostel|Apartment|Residency|Stay|Homes?)\b/gi, "").trim();
  const first = base.split(/[\s,–-]+/)[0] || "Owner";
  return `${first} • Owner`;
};

const initialsFor = (name: string) =>
  name
    .replace(/•.*$/, "")
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "O";

const storageKey = (id: string) => `tp:owner-chat:${id}`;

const autoReplyFor = (text: string, a: Accommodation): string => {
  const t = text.toLowerCase();
  if (/avail|vacant|empty/.test(t))
    return a.available
      ? `Yes, ${a.name} has rooms available right now. When are you planning to move in?`
      : `We're full at the moment, but a room may open up next month. Want me to keep you on the waitlist?`;
  if (/visit|tour|see|come/.test(t))
    return `Sure! You can visit any day between 10 AM – 7 PM. Share your preferred date and I'll keep someone at the gate.`;
  if (/price|rent|cost|negoti|discount/.test(t))
    return `Rent is ${a.currency} ${a.pricePerMonth.toLocaleString()}/month including basics. For long stays (6+ months) we can adjust a bit.`;
  if (/photo|pic|image/.test(t))
    return `I'll send a few more photos of the rooms and common area shortly. What floor would you prefer?`;
  if (/deposit|advance|token/.test(t))
    return `One month rent as refundable deposit + first month rent to confirm the booking.`;
  if (/meal|food|mess|tiffin/.test(t))
    return a.amenities.some((x) => /meal|food/i.test(x))
      ? `Yes, breakfast and dinner are included. Lunch is optional.`
      : `Meals aren't included, but there are great mess options within 2 minutes walking distance.`;
  if (/wifi|internet/.test(t))
    return `High-speed Wi-Fi is available 24×7 in every room.`;
  if (/hi|hello|hey/.test(t))
    return `Hi! Thanks for reaching out about ${a.name}. How can I help?`;
  return `Got it. I'll get back to you in a few minutes with the details. Meanwhile, feel free to ask anything specific.`;
};

export function OwnerChat({
  accommodation,
  onBack,
}: {
  accommodation: Accommodation;
  onBack: () => void;
}) {
  const { addInquiry } = useAdminStore();
  const ownerName = useMemo(() => ownerNameFor(accommodation), [accommodation]);
  const initials = useMemo(() => initialsFor(ownerName), [ownerName]);

  const [msgs, setMsgs] = useState<ChatMsg[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(storageKey(accommodation.id));
      if (raw) return JSON.parse(raw) as ChatMsg[];
    } catch {}
    return [
      {
        id: crypto.randomUUID(),
        from: "owner",
        at: Date.now(),
        read: true,
        text: `Hi 👋 Thanks for your interest in ${accommodation.name}. I'm here to answer any questions about the room, rent or visit timings.`,
      },
    ];
  });
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [phoneReveal, setPhoneReveal] = useState(false);
  const [contactCaptured, setContactCaptured] = useState(false);
  const [contact, setContact] = useState({ name: "", email: "", phone: "" });
  const scrollerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey(accommodation.id), JSON.stringify(msgs));
    } catch {}
  }, [msgs, accommodation.id]);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, typing]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [accommodation.id]);

  const send = (raw: string) => {
    const text = raw.trim();
    if (!text) return;
    const userMsg: ChatMsg = { id: crypto.randomUUID(), from: "me", text, at: Date.now() };
    setMsgs((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);
    // mark previous as read
    setTimeout(() => {
      setMsgs((m) => m.map((x) => (x.from === "me" ? { ...x, read: true } : x)));
    }, 600);
    setTimeout(
      () => {
        const reply: ChatMsg = {
          id: crypto.randomUUID(),
          from: "owner",
          text: autoReplyFor(text, accommodation),
          at: Date.now(),
          read: true,
        };
        setMsgs((m) => [...m, reply]);
        setTyping(false);
      },
      900 + Math.random() * 900,
    );
  };

  const revealPhone = () => {
    if (!contactCaptured) {
      setPhoneReveal(true);
      return;
    }
  };

  const submitContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.name.trim() || !contact.email.trim()) return;
    addInquiry({
      accommodationId: accommodation.id,
      accommodationName: accommodation.name,
      studentName: contact.name.trim(),
      email: contact.email.trim(),
      phone: contact.phone.trim() || undefined,
      city: accommodation.city,
      country: accommodation.country,
      message: `Chat enquiry — last ${msgs.length} messages exchanged with owner.`,
    });
    setContactCaptured(true);
    setPhoneReveal(false);
    setMsgs((m) => [
      ...m,
      {
        id: crypto.randomUUID(),
        from: "owner",
        at: Date.now(),
        read: true,
        text: `Thanks ${contact.name.split(" ")[0]}! You can reach me on ${accommodation.contactPhone ?? "+91 98••• ••345"}. I've also saved your number — I'll call you shortly.`,
      },
    ]);
  };

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 border-b bg-gradient-to-r from-primary/5 to-transparent px-4 py-3">
        <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="relative">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 font-display text-sm font-bold text-primary">
            {initials}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-emerald-500" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight">{ownerName}</p>
          <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <ShieldCheck className="h-3 w-3 text-emerald-600" />
            Verified · Usually replies in a few minutes
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={revealPhone}>
          <Phone className="mr-1.5 h-3.5 w-3.5" />
          {contactCaptured ? (accommodation.contactPhone ?? "Call") : "Call"}
        </Button>
      </div>

      {/* Listing strip */}
      <div className="flex items-center gap-3 border-b bg-muted/30 px-4 py-2.5">
        <img
          src={accommodation.imageUrl}
          alt={accommodation.name}
          className="h-10 w-14 rounded-md object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold">{accommodation.name}</p>
          <p className="truncate text-[11px] text-muted-foreground">
            {accommodation.city} · {accommodation.currency} {accommodation.pricePerMonth.toLocaleString()}/mo
          </p>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollerRef}
        className="h-[26rem] space-y-2.5 overflow-y-auto bg-[radial-gradient(circle_at_1px_1px,hsl(var(--muted-foreground)/0.08)_1px,transparent_0)] bg-[size:18px_18px] px-4 py-4"
      >
        {msgs.map((m) => (
          <div key={m.id} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-sm shadow-sm ${
                m.from === "me"
                  ? "rounded-br-md bg-primary text-primary-foreground"
                  : "rounded-bl-md border bg-card"
              }`}
            >
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
        {typing && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border bg-card px-3 py-2.5">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      {/* Phone reveal modal-ish strip */}
      {phoneReveal && !contactCaptured && (
        <form onSubmit={submitContact} className="border-t bg-muted/40 px-4 py-3">
          <p className="mb-2 text-xs font-medium">
            Share your contact to see the owner's number — they'll also call you back.
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            <Input
              required
              placeholder="Your name"
              value={contact.name}
              onChange={(e) => setContact({ ...contact, name: e.target.value })}
              maxLength={80}
            />
            <Input
              required
              type="email"
              placeholder="Email"
              value={contact.email}
              onChange={(e) => setContact({ ...contact, email: e.target.value })}
              maxLength={120}
            />
            <Input
              type="tel"
              placeholder="Phone (optional)"
              value={contact.phone}
              onChange={(e) => setContact({ ...contact, phone: e.target.value })}
              maxLength={20}
            />
          </div>
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setPhoneReveal(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Show number
            </Button>
          </div>
        </form>
      )}

      {/* Quick replies */}
      <div className="flex gap-2 overflow-x-auto border-t bg-card px-4 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {QUICK_REPLIES.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => send(q)}
            className="shrink-0 rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground transition hover:border-primary hover:text-primary"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t bg-card px-3 py-2.5"
      >
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Message ${ownerName.replace(" • Owner", "")}…`}
          maxLength={500}
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={!input.trim()} aria-label="Send">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
