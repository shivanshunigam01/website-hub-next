"use client";


import { useMemo, useState } from "react";
import { Plus, LifeBuoy, Send, Mail, Clock, CheckCircle2 } from "lucide-react";
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
import { usePlatformStore, type TicketCategory, type TicketPriority, type TicketAuthorRole, type SupportTicket } from "@/hooks/use-platform-store";
import { useApp } from "@/hooks/use-app";



const STATUS_TONE: Record<string, string> = {
  open: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  in_progress: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
  waiting: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  resolved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  closed: "bg-muted text-muted-foreground",
};

function Support() {
  const { tickets, createTicket, replyTicket } = usePlatformStore();
  const { role } = useApp();
  const [open, setOpen] = useState<SupportTicket | null>(null);
  const [reply, setReply] = useState("");
  const [form, setForm] = useState({
    subject: "",
    description: "",
    category: "account" as TicketCategory,
    categoryOther: "",
    priority: "medium" as TicketPriority,
    requesterName: "",
    requesterEmail: "",
  });

  const myRole: TicketAuthorRole = useMemo(() => {
    if (role === "student" || role === "teacher" || role === "parent") return role;
    return "guest";
  }, [role]);

  const myTickets = useMemo(() => {
    if (!form.requesterEmail) return tickets.slice(0, 6);
    return tickets.filter((t) => t.requesterEmail === form.requesterEmail);
  }, [tickets, form.requesterEmail]);

  const live = open ? tickets.find((t) => t.id === open.id) ?? null : null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject || !form.description || !form.requesterName || !form.requesterEmail) {
      toast.error("Fill in all fields");
      return;
    }
    if (form.category === "other" && !form.categoryOther.trim()) {
      toast.error("Please specify the category");
      return;
    }
    const t = createTicket({
      ...form,
      categoryOther: form.category === "other" ? form.categoryOther.trim() : undefined,
      requesterRole: myRole,
      firstMessage: form.description,
    });
    toast.success(`Ticket ${t.id} created — we'll email you at ${t.requesterEmail}`);
    setForm({ ...form, subject: "", description: "" });
  };

  return (
    <section className="container mx-auto px-4 py-10 max-w-6xl">
      <div className="flex items-center gap-3 mb-2">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-white">
          <LifeBuoy className="h-5 w-5" />
        </span>
        <h1 className="font-display font-extrabold text-3xl">Support center</h1>
      </div>
      <p className="text-muted-foreground">Submit issues, track tickets, and chat with our team. We typically respond in under 4 hours.</p>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6 mt-8">
        <div className="bg-card border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="font-display font-bold flex items-center gap-2"><Mail className="h-4 w-4" /> Tickets</h2>
            <Badge variant="outline">{myTickets.length} ticket(s)</Badge>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Subject</TableHead><TableHead>Priority</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>
                {myTickets.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">No tickets yet.</TableCell></TableRow>}
                {myTickets.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono text-xs">{t.id}</TableCell>
                    <TableCell>
                      <div className="font-medium">{t.subject}</div>
                      <div className="text-xs text-muted-foreground capitalize">{t.category}</div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{t.priority}</Badge></TableCell>
                    <TableCell><Badge className={STATUS_TONE[t.status]}>{t.status.replace("_", " ")}</Badge></TableCell>
                    <TableCell><Button size="sm" variant="ghost" onClick={() => { setOpen(t); setReply(""); }}>View</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <form className="bg-card border rounded-2xl p-5 h-fit" onSubmit={submit}>
          <h2 className="font-display font-bold mb-4 flex items-center gap-2"><Plus className="h-4 w-4" />New ticket</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Your name</Label><Input required value={form.requesterName} onChange={(e) => setForm({ ...form, requesterName: e.target.value })} /></div>
              <div><Label>Email</Label><Input required type="email" value={form.requesterEmail} onChange={(e) => setForm({ ...form, requesterEmail: e.target.value })} /></div>
            </div>
            <div><Label>Subject</Label><Input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Category</Label>
                <SelectWithOther
                  mode="enum-other"
                  options={[
                    { value: "account", label: "Account" },
                    { value: "payments", label: "Payments" },
                    { value: "course", label: "Course" },
                    { value: "tutor", label: "Tutor" },
                    { value: "technical", label: "Technical" },
                  ]}
                  value={form.category}
                  customValue={form.categoryOther}
                  onValueChange={(v) => setForm({ ...form, category: v as TicketCategory })}
                  onCustomValueChange={(v) => setForm({ ...form, categoryOther: v })}
                  otherPlaceholder="Specify category"
                />
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as TicketPriority })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Description</Label><Textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="min-h-[120px]" /></div>
            <Button type="submit" size="lg" variant="gradient" className="w-full"><Send className="h-4 w-4" /> Submit ticket</Button>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> You'll receive updates by email.</p>
          </div>
        </form>
      </div>

      <Dialog open={!!live} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-w-xl">
          {live && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">{live.id}</span>
                  {live.subject}
                </DialogTitle>
              </DialogHeader>
              <div className="flex gap-2 flex-wrap text-xs">
                <Badge className={STATUS_TONE[live.status]}>{live.status.replace("_", " ")}</Badge>
                <Badge variant="outline" className="capitalize">{live.priority}</Badge>
                <Badge variant="outline" className="capitalize">{live.category}</Badge>
              </div>
              <div className="space-y-3 max-h-72 overflow-auto border rounded-xl p-3 bg-muted/30">
                <div className="text-sm whitespace-pre-wrap">{live.description}</div>
                {live.messages.map((m) => (
                  <div key={m.id} className={`text-sm p-3 rounded-lg border ${m.authorRole === "admin" ? "bg-primary/5 border-primary/30" : "bg-background"}`}>
                    <div className="text-[11px] text-muted-foreground mb-1 capitalize">{m.author} · {m.authorRole}</div>
                    <div className="whitespace-pre-wrap">{m.message}</div>
                  </div>
                ))}
              </div>
              {live.status !== "closed" && (
                <>
                  <Textarea placeholder="Add a reply..." value={reply} onChange={(e) => setReply(e.target.value)} className="min-h-[80px]" />
                  <Button onClick={() => {
                    if (!reply.trim()) return toast.error("Type a message");
                    replyTicket(live.id, { author: form.requesterName || live.requesterName, authorRole: myRole, message: reply.trim() });
                    setReply("");
                    toast.success("Reply added");
                  }}><Send className="h-4 w-4" /> Reply</Button>
                </>
              )}
              {live.status === "resolved" && (
                <div className="text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> This ticket has been resolved.</div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

export default Support;
