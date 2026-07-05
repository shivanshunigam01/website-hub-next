"use client";

import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const QUICK = ["Find a tutor", "Course pricing", "Refund policy", "Teach on the platform"];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<{ from: "bot" | "user"; text: string }[]>([
    { from: "bot", text: "Hi - how can we help you today? Ask about tutors, courses, or getting started." },
  ]);
  const [input, setInput] = useState("");

  const send = (text: string) => {
    if (!text.trim()) return;
    setMsgs((m) => [
      ...m,
      { from: "user", text },
      {
        from: "bot",
        text: "Thanks for your message. Browse tutors and courses on the site, or contact support if you need a hand.",
      },
    ]);
    setInput("");
  };

  return (
    <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end gap-2 lg:bottom-6">
      {open && (
        <div className="flex h-[min(28rem,70dvh)] w-[min(100vw-2rem,22rem)] flex-col overflow-hidden rounded-xl border bg-card shadow-lg">
          <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-3">
            <div>
              <p className="text-sm font-semibold">Help & support</p>
              <p className="text-xs text-muted-foreground">We typically reply within a few hours</p>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="rounded-md p-1.5 hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {msgs.map((m, i) => (
              <p
                key={i}
                className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm ${
                  m.from === "bot" ? "bg-muted text-foreground" : "ml-auto bg-primary text-primary-foreground"
                }`}
              >
                {m.text}
              </p>
            ))}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {QUICK.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => send(q)}
                  className="rounded-full border px-2.5 py-1 text-xs hover:bg-muted"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex gap-2 border-t p-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              className="rounded-lg"
            />
            <Button type="submit" size="icon" className="shrink-0" aria-label="Send">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
      <button
        type="button"
        aria-label={open ? "Close help" : "Open help"}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition hover:bg-primary/90"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>
    </div>
  );
}
