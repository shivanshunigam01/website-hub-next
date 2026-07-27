"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, LifeBuoy, Send, Mail, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SelectWithOther } from "@/components/ui/SelectWithOther";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useApp } from "@/hooks/use-app";
import { formatApiErrorMessage } from "@/lib/api";
import {
  createTicket,
  fetchTickets,
  replyTicket,
  type SupportTicket,
} from "@/services/tickets-api";
import { Link } from "@/lib/navigation";

const STATUS_TONE: Record<string, string> = {
  open: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  in_progress: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
  waiting: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  resolved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  closed: "bg-muted text-muted-foreground",
};

const CATEGORY_KEYS = [
  { value: "account", key: "support.cat.account" },
  { value: "payments", key: "support.cat.payments" },
  { value: "course", key: "support.cat.course" },
  { value: "tutor", key: "support.cat.tutor" },
  { value: "technical", key: "support.cat.technical" },
] as const;

const PRIORITY_KEYS = [
  { value: "low", key: "support.priority.low" },
  { value: "medium", key: "support.priority.medium" },
  { value: "high", key: "support.priority.high" },
  { value: "urgent", key: "support.priority.urgent" },
] as const;

function Support() {
  const { t } = useTranslation("common");
  const { user, role } = useApp();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState<SupportTicket | null>(null);
  const [reply, setReply] = useState("");
  const [replying, setReplying] = useState(false);
  const [form, setForm] = useState({
    subject: "",
    description: "",
    category: "account",
    categoryOther: "",
    priority: "medium",
    requesterName: "",
    requesterEmail: "",
  });

  useEffect(() => {
    if (!user) return;
    setForm((f) => ({
      ...f,
      requesterName: f.requesterName || user.name || "",
      requesterEmail: f.requesterEmail || user.email || "",
    }));
  }, [user]);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      setTickets(await fetchTickets());
    } catch (e) {
      toast.error(formatApiErrorMessage(e, "Could not load tickets"));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const live = useMemo(() => {
    if (!open) return null;
    return tickets.find((tk) => tk.id === open.id) ?? open;
  }, [open, tickets]);

  const categoryOptions = CATEGORY_KEYS.map((c) => ({
    value: c.value,
    label: t(c.key),
  }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error(t("support.signInRequired", "Sign in to create a support ticket"));
      return;
    }
    if (!form.subject || !form.description) {
      toast.error(t("support.fillAllFields", "Fill in all fields"));
      return;
    }
    if (form.category === "other" && !form.categoryOther.trim()) {
      toast.error(t("support.specifyCategory", "Please specify the category"));
      return;
    }
    setSubmitting(true);
    try {
      const created = await createTicket({
        subject: form.subject.trim(),
        description: form.description.trim(),
        priority: form.priority,
        category: form.category === "other" ? form.categoryOther.trim() : form.category,
        requesterName: form.requesterName.trim() || user.name,
        requesterEmail: form.requesterEmail.trim() || user.email,
      });
      setTickets((prev) => [created, ...prev]);
      toast.success(
        t("support.ticketCreated", "Ticket {{id}} created — we'll email you at {{email}}", {
          id: created.ticketNumber || created.id,
          email: created.requesterEmail || user.email,
        }),
      );
      setForm((f) => ({ ...f, subject: "", description: "" }));
    } catch (err) {
      toast.error(formatApiErrorMessage(err, "Could not create ticket"));
    } finally {
      setSubmitting(false);
    }
  };

  const sendReply = async () => {
    if (!live || !reply.trim()) {
      toast.error(t("support.typeMessage", "Type a message"));
      return;
    }
    setReplying(true);
    try {
      const updated = await replyTicket(live.id, reply.trim());
      setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setOpen(updated);
      setReply("");
      toast.success(t("support.replyAdded", "Reply added"));
    } catch (err) {
      toast.error(formatApiErrorMessage(err, "Could not send reply"));
    } finally {
      setReplying(false);
    }
  };

  if (!user) {
    return (
      <section className="container mx-auto max-w-3xl px-4 py-10">
        <h1 className="font-display text-3xl font-extrabold">{t("support.title")}</h1>
        <p className="mt-2 text-muted-foreground">
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>{" "}
          to create and track support tickets.
        </p>
      </section>
    );
  }

  return (
    <section className="container mx-auto max-w-6xl px-4 py-10">
      <div className="mb-2 flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-white">
          <LifeBuoy className="h-5 w-5" />
        </span>
        <h1 className="font-display text-3xl font-extrabold">{t("support.title")}</h1>
      </div>
      <p className="text-muted-foreground">{t("support.subtitle")}</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="rounded-2xl border bg-card p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 font-display font-bold">
              <Mail className="h-4 w-4" /> {t("support.tickets")}
            </h2>
            <Badge variant="outline">{t("support.ticketCount", { count: tickets.length })}</Badge>
          </div>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("support.colId")}</TableHead>
                    <TableHead>{t("support.colSubject")}</TableHead>
                    <TableHead>{t("support.colPriority")}</TableHead>
                    <TableHead>{t("support.colStatus")}</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-6 text-center text-muted-foreground">
                        {t("support.empty")}
                      </TableCell>
                    </TableRow>
                  )}
                  {tickets.map((tk) => (
                    <TableRow key={tk.id}>
                      <TableCell className="font-mono text-xs">{tk.ticketNumber || tk.id}</TableCell>
                      <TableCell>
                        <div className="font-medium">{tk.subject}</div>
                        <div className="text-xs capitalize text-muted-foreground">{tk.category}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {tk.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_TONE[tk.status] || STATUS_TONE.open}>
                          {tk.status.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setOpen(tk);
                            setReply("");
                          }}
                        >
                          {t("support.view")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <form className="h-fit rounded-2xl border bg-card p-5" onSubmit={(e) => void submit(e)}>
          <h2 className="mb-4 flex items-center gap-2 font-display font-bold">
            <Plus className="h-4 w-4" />
            {t("support.newTicket")}
          </h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>{t("support.yourName")}</Label>
                <Input
                  required
                  value={form.requesterName}
                  onChange={(e) => setForm({ ...form, requesterName: e.target.value })}
                />
              </div>
              <div>
                <Label>{t("support.email")}</Label>
                <Input
                  required
                  type="email"
                  value={form.requesterEmail}
                  onChange={(e) => setForm({ ...form, requesterEmail: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>{t("support.subject")}</Label>
              <Input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>{t("support.category")}</Label>
                <SelectWithOther
                  mode="enum-other"
                  options={categoryOptions}
                  value={form.category}
                  customValue={form.categoryOther}
                  onValueChange={(v) => setForm({ ...form, category: v })}
                  onCustomValueChange={(v) => setForm({ ...form, categoryOther: v })}
                  otherPlaceholder={t("support.specifyCategoryPlaceholder", "Specify category")}
                />
              </div>
              <div>
                <Label>{t("support.priority")}</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_KEYS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {t(p.key)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>{t("support.description")}</Label>
              <Textarea
                required
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="min-h-[120px]"
              />
            </div>
            <Button type="submit" size="lg" variant="gradient" className="w-full" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}{" "}
              {t("support.submit")}
            </Button>
            <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="h-3 w-3" /> {t("support.emailUpdates")} · signed in as {role}
            </p>
          </div>
        </form>
      </div>

      <Dialog open={!!live} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-w-xl">
          {live && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">
                    {live.ticketNumber || live.id}
                  </span>
                  {live.subject}
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge className={STATUS_TONE[live.status] || STATUS_TONE.open}>
                  {live.status.replace(/_/g, " ")}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {live.priority}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {live.category}
                </Badge>
              </div>
              <div className="max-h-72 space-y-3 overflow-auto rounded-xl border bg-muted/30 p-3">
                {(live.messages || []).length === 0 ? (
                  <div className="whitespace-pre-wrap text-sm">{live.description}</div>
                ) : (
                  live.messages.map((m, i) => (
                    <div
                      key={m.id || i}
                      className={`rounded-lg border p-3 text-sm ${
                        m.authorRole === "admin" ? "border-primary/30 bg-primary/5" : "bg-background"
                      }`}
                    >
                      <div className="mb-1 text-[11px] capitalize text-muted-foreground">
                        {m.authorRole || "user"}
                        {m.createdAt ? ` · ${new Date(m.createdAt).toLocaleString()}` : ""}
                      </div>
                      <div className="whitespace-pre-wrap">{m.message || m.body}</div>
                    </div>
                  ))
                )}
              </div>
              {live.status !== "closed" && (
                <>
                  <Textarea
                    placeholder={t("support.replyPlaceholder")}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <Button onClick={() => void sendReply()} disabled={replying}>
                    {replying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}{" "}
                    {t("support.reply")}
                  </Button>
                </>
              )}
              {live.status === "resolved" && (
                <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" /> {t("support.resolved")}
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

export default Support;
