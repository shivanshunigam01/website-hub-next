"use client";

import { Link, useSearch } from "@/lib/navigation";
import { useEffect, useMemo, useState } from "react";
import { Send, Search, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTutors, useTutor } from "@/hooks/use-catalog";
import type { Tutor } from "@/types/catalog";
import { tutorImage } from "@/data/images";
import { cn } from "@/lib/utils";
import { AppImage } from "@/components/AppImage";

function Messages() {
  const { tutorId } = useSearch<{ tutorId?: string }>();
  const { data: tutors = [] } = useTutors(50);
  const { data: linkedTutor } = useTutor(tutorId);
  const [active, setActive] = useState<Tutor | null>(null);
  const [draft, setDraft] = useState("");
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  const threadTutors = useMemo(() => {
    if (!linkedTutor) return tutors;
    if (tutors.some((t) => t.id === linkedTutor.id)) return tutors;
    return [linkedTutor, ...tutors];
  }, [tutors, linkedTutor]);

  useEffect(() => {
    if (linkedTutor) {
      setActive(linkedTutor);
      setMobileChatOpen(true);
      return;
    }
    if (threadTutors.length && !active) {
      setActive(threadTutors[0]);
    }
  }, [linkedTutor, threadTutors, active]);

  const selectThread = (tutor: Tutor) => {
    setActive(tutor);
    setMobileChatOpen(true);
  };

  if (!active) {
    return (
      <section className="container mx-auto px-4 py-6">
        <h1 className="mb-4 font-display text-2xl font-extrabold">Messages</h1>
        <p className="text-sm text-muted-foreground">
          No tutors available yet.{" "}
          <Link to="/tutors" className="font-semibold text-primary hover:underline">
            Browse tutors
          </Link>{" "}
          to start a conversation.
        </p>
      </section>
    );
  }

  const img = active.avatarUrl || active.image || tutorImage(active.id);

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
              <Input placeholder="Search…" className="pl-10" />
            </div>
          </div>
          {threadTutors.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => selectThread(t)}
              className={`flex w-full items-center gap-3 p-3 text-left hover:bg-muted/40 ${active.id === t.id ? "bg-muted/50" : ""}`}
            >
              <AppImage
                src={t.avatarUrl || t.image || tutorImage(t.id)}
                alt=""
                width={40}
                height={40}
                sizes="40px"
                className="h-10 w-10 shrink-0 rounded-full object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{t.name}</div>
                <div className="truncate text-xs text-muted-foreground">{t.subject}</div>
              </div>
            </button>
          ))}
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
              src={img}
              alt=""
              width={36}
              height={36}
              sizes="36px"
              className="h-9 w-9 shrink-0 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{active.name}</div>
              <div className="text-xs text-emerald-600">● Ready to chat</div>
            </div>
            <Button asChild size="sm" variant="outline" className="ms-auto shrink-0">
              <Link to="/tutors/$id" params={{ id: active.id }}>
                <span className="hidden sm:inline">View profile</span>
                <span className="sm:hidden">Profile</span>
              </Link>
            </Button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto bg-muted/20 p-4">
            <div className="max-w-[85%] rounded-2xl rounded-tl-sm border bg-card p-3 text-sm sm:max-w-[75%]">
              Hi! I&apos;m {active.name}. Send a message to discuss your learning goals or book a
              session.
            </div>
          </div>
          <form
            className="flex gap-2 border-t p-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!draft.trim()) return;
              setDraft("");
            }}
          >
            <Input
              placeholder="Type a message…"
              className="min-w-0 flex-1"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <Button type="submit" size="icon" variant="gradient" className="shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Messages;
