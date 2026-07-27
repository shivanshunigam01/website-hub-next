"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { ShieldCheck, UserPlus, Trash2, Pencil, Send, Mail, CheckCircle2, XCircle, AlertTriangle, MessageSquare, Flag, Server, Crown, Wrench, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useAdminPermission, STAFF_ROLE_LABELS } from "@/hooks/use-admin-permissions";
import { IpAddressCell, UserIpSummary } from "@/components/admin/IpAddressCell";
import {
  usePlatformStore,
  ROLE_PERMISSIONS,
  type AdminRole,
  type AdminMember,
  type CourseSubmission,
  type UserReport,
  type NotificationAudience,
  type NotificationChannel,
} from "@/hooks/use-platform-store";
import { useApp } from "@/hooks/use-app";
import { getAdminTeam, type AdminTeamMember } from "@/services/admin-team-api";
import {
  fetchMyNotifications,
  sendBroadcastNotification,
  type AppNotification,
} from "@/services/notifications-api";
import { formatApiErrorMessage } from "@/lib/api";
import {
  fetchTickets,
  replyTicket,
  updateTicket,
  type SupportTicket as ApiTicket,
} from "@/services/tickets-api";

/* ============ Permission Gate ============ */
export function PermissionGate({ permission, children, fallback }: { permission: string; children: React.ReactNode; fallback?: React.ReactNode }) {
  const { hasPermission } = useAdminPermission();
  const { user } = useApp();
  const allowed = user?.role === "admin" && hasPermission(permission);
  const roleLabel = user?.staffRole ? STAFF_ROLE_LABELS[user.staffRole as AdminRole] : "Admin";
  if (!allowed) {
    return (
      <div className="bg-card border rounded-2xl p-8 text-center">
        <ShieldCheck className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
        <h3 className="font-display font-bold text-lg">Access restricted</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Your role <Badge variant="outline" className="mx-1">{roleLabel}</Badge>
          does not have the <code className="text-xs">{permission}</code> permission.
        </p>
        {fallback}
      </div>
    );
  }
  return <>{children}</>;
}

const ROLE_META: Record<AdminRole, { label: string; icon: typeof Crown; tone: string }> = {
  super_admin: { label: "Super Admin", icon: Crown, tone: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" },
  manager: { label: "Manager", icon: ShieldCheck, tone: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300" },
  moderator: { label: "Moderator", icon: Wrench, tone: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" },
};

/* ============ Role badge (logged-in staff account) ============ */
export function AdminRoleSwitcher() {
  const { user } = useApp();
  if (!user || user.role !== "admin" || !user.staffRole) return null;
  const role = user.staffRole as AdminRole;
  const meta = ROLE_META[role];
  const Icon = meta.icon;
  return (
      <div className="flex flex-col gap-1.5 bg-muted/40 border rounded-xl px-3 py-2 min-w-0">
      <div className="flex items-center gap-2 flex-wrap">
        <ShieldCheck className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="text-xs text-muted-foreground">Signed in as</span>
        <Badge className={`${meta.tone} gap-1 font-medium`}>
          <Icon className="h-3 w-3" />
          {user.name} — {meta.label}
        </Badge>
      </div>
      <UserIpSummary
        registrationIp={user.registrationIp}
        lastLoginIp={user.lastLoginIp}
        lastLoginAt={user.lastLoginAt}
        compact
      />
    </div>
  );
}

/* ============ Team / RBAC ============ */
export function TeamPanel() {
  const { team, addMember, updateMember, deleteMember } = usePlatformStore();
  const { user: currentUser } = useApp();
  const [apiTeam, setApiTeam] = useState<AdminTeamMember[]>([]);
  const [teamLoading, setTeamLoading] = useState(true);
  const [editing, setEditing] = useState<AdminMember | null>(null);
  const [open, setOpen] = useState(false);

  const loadTeam = useCallback(async () => {
    setTeamLoading(true);
    try {
      const rows = await getAdminTeam();
      setApiTeam(rows);
    } catch (e) {
      toast.error(formatApiErrorMessage(e, "Failed to load admin team"));
    } finally {
      setTeamLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  const displayTeam = apiTeam.length > 0 ? apiTeam : team.map((m) => ({
    id: m.id,
    userId: m.id,
    staffRole: m.role,
    isActive: m.active,
    name: m.name,
    email: m.email,
    registrationIp: "",
    lastLoginIp: "",
    lastLoginAt: null,
    ipRiskFlag: false,
  }));

  return (
    <PermissionGate permission="team.manage">
      <div className="bg-card border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h2 className="font-display font-bold text-lg">Admin team & roles</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Super Admin · Manager · Moderator — each account shows registration & last login IP.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadTeam}>
              Refresh IPs
            </Button>
            <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }}>
              <UserPlus className="h-4 w-4" /> Add member
            </Button>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mb-6">
          {(Object.keys(ROLE_META) as AdminRole[]).map((r) => {
            const meta = ROLE_META[r];
            const Icon = meta.icon;
            return (
              <div key={r} className="border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${meta.tone}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="font-semibold">{meta.label}</div>
                </div>
                <div className="text-[11px] text-muted-foreground leading-relaxed">
                  {ROLE_PERMISSIONS[r].length} permissions · {displayTeam.filter((t) => t.staffRole === r).length} member(s)
                </div>
                <div className="flex flex-wrap gap-1 mt-3">
                  {ROLE_PERMISSIONS[r].slice(0, 4).map((p) => (
                    <Badge key={p} variant="outline" className="text-[10px]">{p}</Badge>
                  ))}
                  {ROLE_PERMISSIONS[r].length > 4 && <Badge variant="outline" className="text-[10px]">+{ROLE_PERMISSIONS[r].length - 4}</Badge>}
                </div>
              </div>
            );
          })}
        </div>

        {teamLoading ? (
          <p className="text-sm text-muted-foreground py-6 text-center">Loading team & IP addresses…</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>IP addresses</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayTeam.map((m) => {
                const role = m.staffRole as AdminRole;
                const meta = ROLE_META[role];
                const isYou = currentUser?.id === m.userId || currentUser?.email === m.email;
                return (
                  <TableRow key={m.id}>
                    <TableCell>
                      <div className="font-medium">
                        {m.name}
                        {isYou && <Badge variant="outline" className="ml-1 text-[10px]">you</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground">{m.email}</div>
                    </TableCell>
                    <TableCell><Badge className={meta.tone}>{meta.label}</Badge></TableCell>
                    <TableCell>
                      <UserIpSummary
                        registrationIp={m.registrationIp}
                        lastLoginIp={m.lastLoginIp}
                        lastLoginAt={m.lastLoginAt}
                      />
                    </TableCell>
                    <TableCell>
                      {m.isActive ? (
                        <Badge className="bg-emerald-600">Active</Badge>
                      ) : (
                        <Badge variant="destructive">Inactive</Badge>
                      )}
                      {m.ipRiskFlag && (
                        <Badge variant="outline" className="ml-1 text-[10px]">IP flagged</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {apiTeam.length === 0 && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => { setEditing(team.find((t) => t.id === m.id) ?? null); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => { deleteMember(m.id); toast.success("Removed"); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <MemberDialog open={open} onOpenChange={setOpen} member={editing} onSave={(m) => {
        if (editing) { updateMember(editing.id, m); toast.success("Member updated"); }
        else { addMember(m as Omit<AdminMember, "id" | "createdAt" | "active">); toast.success("Member added"); }
        setOpen(false);
      }} />
    </PermissionGate>
  );
}

function MemberDialog({ open, onOpenChange, member, onSave }: { open: boolean; onOpenChange: (v: boolean) => void; member: AdminMember | null; onSave: (m: Partial<AdminMember>) => void }) {
  const [form, setForm] = useState<Partial<AdminMember>>(member ?? { name: "", email: "", role: "moderator" });
  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (v) setForm(member ?? { name: "", email: "", role: "moderator" }); }}>
      <DialogContent>
        <DialogHeader><DialogTitle>{member ? "Edit member" : "Add admin member"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Name</Label><Input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Email</Label><Input type="email" value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div>
            <Label>Role</Label>
            <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as AdminRole })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onSave(form)} disabled={!form.name || !form.email}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ============ Tickets ============ */
export function TicketsPanel() {
  const [tickets, setTickets] = useState<ApiTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<ApiTicket | null>(null);
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setTickets(await fetchTickets({}));
    } catch (e) {
      toast.error(formatApiErrorMessage(e, "Could not load tickets"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const live = active ? tickets.find((t) => t.id === active.id) ?? active : null;

  const setStatus = async (id: string, status: string) => {
    try {
      const updated = await updateTicket(id, { status });
      setTickets((prev) => prev.map((t) => (t.id === id ? updated : t)));
      if (active?.id === id) setActive(updated);
    } catch (e) {
      toast.error(formatApiErrorMessage(e, "Could not update ticket"));
    }
  };

  return (
    <PermissionGate permission="tickets.manage">
      <div className="rounded-2xl border bg-card p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold">Support tickets</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Live tickets from students and teachers.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["open", "in_progress", "resolved"] as const).map((s) => (
              <Badge key={s} variant="outline" className="text-[11px]">
                {s.replace("_", " ")}: {tickets.filter((t) => t.status === s).length}
              </Badge>
            ))}
          </div>
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
                  <TableHead>ID</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      No tickets yet.
                    </TableCell>
                  </TableRow>
                )}
                {tickets.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono text-xs">{t.ticketNumber || t.id.slice(-8)}</TableCell>
                    <TableCell>
                      <div className="font-medium">{t.subject}</div>
                      <div className="line-clamp-1 text-xs text-muted-foreground">{t.description}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{t.requesterName || "User"}</div>
                      <div className="text-xs text-muted-foreground">{t.requesterEmail}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className="capitalize">{t.priority}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="capitalize">{t.status.replace(/_/g, " ")}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setActive(t);
                          setReply("");
                        }}
                      >
                        <MessageSquare className="h-4 w-4" /> Open
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={!!live} onOpenChange={(v) => !v && setActive(null)}>
        <DialogContent className="max-w-2xl">
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
                <Badge className="capitalize">{live.priority}</Badge>
                <Badge className="capitalize">{live.status.replace(/_/g, " ")}</Badge>
                <Badge variant="outline">{live.category}</Badge>
                <Badge variant="outline">
                  {live.requesterName} · {live.requesterEmail}
                </Badge>
              </div>
              <div className="max-h-72 space-y-3 overflow-auto rounded-xl border bg-muted/30 p-3">
                {(live.messages || []).map((m, i) => (
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
                ))}
              </div>
              <Textarea
                placeholder="Type your reply..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                className="min-h-[90px]"
              />
              <DialogFooter className="flex-wrap gap-2">
                <Select value={live.status} onValueChange={(v) => void setStatus(live.id, v)}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["open", "in_progress", "resolved", "closed"] as const).map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  disabled={busy}
                  onClick={() => {
                    void (async () => {
                      if (!reply.trim()) return toast.error("Type a reply");
                      setBusy(true);
                      try {
                        const updated = await replyTicket(live.id, reply.trim());
                        setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
                        setActive(updated);
                        setReply("");
                        toast.success("Reply sent");
                      } catch (e) {
                        toast.error(formatApiErrorMessage(e, "Could not reply"));
                      } finally {
                        setBusy(false);
                      }
                    })();
                  }}
                >
                  <Send className="h-4 w-4" /> Send reply
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PermissionGate>
  );
}

/* ============ Course Approvals ============ */
export function ApprovalsPanel() {
  const { submissions, reviewSubmission, currentAdmin } = usePlatformStore();
  const [reviewing, setReviewing] = useState<CourseSubmission | null>(null);
  const [note, setNote] = useState("");

  const pending = submissions.filter((s) => s.status === "pending");
  const decided = submissions.filter((s) => s.status !== "pending");

  return (
    <PermissionGate permission="courses.approve">
      <div className="space-y-5">
        <div className="bg-card border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg">Pending course approvals ({pending.length})</h2>
            <Badge variant="outline">Queue</Badge>
          </div>
          <Table>
            <TableHeader><TableRow><TableHead>Course</TableHead><TableHead>Instructor</TableHead><TableHead>Category</TableHead><TableHead>Price</TableHead><TableHead className="text-right">Review</TableHead></TableRow></TableHeader>
            <TableBody>
              {pending.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">No pending submissions.</TableCell></TableRow>}
              {pending.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.title}</TableCell>
                  <TableCell>{s.instructor}</TableCell>
                  <TableCell><Badge variant="outline">{s.category}</Badge></TableCell>
                  <TableCell>${s.price}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => { setReviewing(s); setNote(""); }}>Review</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="bg-card border rounded-2xl p-5">
          <h2 className="font-display font-bold text-lg mb-4">Recent decisions</h2>
          <Table>
            <TableHeader><TableRow><TableHead>Course</TableHead><TableHead>Status</TableHead><TableHead>Note</TableHead></TableRow></TableHeader>
            <TableBody>
              {decided.map((s) => (
                <TableRow key={s.id}>
                  <TableCell><div className="font-medium">{s.title}</div><div className="text-xs text-muted-foreground">{s.instructor}</div></TableCell>
                  <TableCell>
                    {s.status === "approved" ? (
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>
                    ) : (
                      <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{s.reviewNote || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={!!reviewing} onOpenChange={(v) => !v && setReviewing(null)}>
        <DialogContent>
          {reviewing && (
            <>
              <DialogHeader><DialogTitle>Review: {reviewing.title}</DialogTitle></DialogHeader>
              <div className="text-sm space-y-1">
                <div><span className="text-muted-foreground">Instructor:</span> {reviewing.instructor}</div>
                <div><span className="text-muted-foreground">Category:</span> {reviewing.category}</div>
                <div><span className="text-muted-foreground">Price:</span> ${reviewing.price}</div>
              </div>
              <div><Label>Review note</Label><Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note to the instructor..." /></div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { reviewSubmission(reviewing.id, "rejected", note, currentAdmin?.id ?? ""); setReviewing(null); toast.success("Course rejected"); }}>
                  <XCircle className="h-4 w-4" /> Reject
                </Button>
                <Button onClick={() => { reviewSubmission(reviewing.id, "approved", note, currentAdmin?.id ?? ""); setReviewing(null); toast.success("Course approved & published"); }}>
                  <CheckCircle2 className="h-4 w-4" /> Approve
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PermissionGate>
  );
}

/* ============ Reports ============ */
export function ReportsPanel() {
  const { reports, updateReport } = usePlatformStore();
  return (
    <PermissionGate permission="reports.view">
      <div className="bg-card border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display font-bold text-lg flex items-center gap-2"><Flag className="h-4 w-4" /> User & content reports</h2>
            <p className="text-xs text-muted-foreground mt-1">Triage reports from the community.</p>
          </div>
          <Badge variant="outline">{reports.filter((r) => r.status === "open").length} open</Badge>
        </div>
        <Table>
          <TableHeader><TableRow><TableHead>Target</TableHead><TableHead>Reason</TableHead><TableHead>Details</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {reports.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <div className="font-medium">{r.targetName}</div>
                  <div className="text-xs text-muted-foreground capitalize">{r.targetType} · by {r.reportedBy}</div>
                </TableCell>
                <TableCell><Badge variant="outline" className="capitalize">{r.reason}</Badge></TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-xs">{r.details}</TableCell>
                <TableCell>
                  <Select value={r.status} onValueChange={(v) => updateReport(r.id, { status: v as UserReport["status"] })}>
                    <SelectTrigger className="h-8 text-xs w-[140px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="investigating">Investigating</SelectItem>
                      <SelectItem value="actioned">Actioned</SelectItem>
                      <SelectItem value="dismissed">Dismissed</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right">
                  <PermissionGate permission="reports.resolve" fallback={null}>
                    <Button size="sm" variant="outline" onClick={() => { updateReport(r.id, { status: "actioned", resolvedNote: "Resolved by admin" }); toast.success("Marked actioned"); }}>
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  </PermissionGate>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </PermissionGate>
  );
}

/* ============ Notifications (SMTP) ============ */
export function NotificationsPanel() {
  const { smtp, updateSmtp } = usePlatformStore();
  const [form, setForm] = useState<{
    subject: string;
    body: string;
    audience: NotificationAudience;
    channel: NotificationChannel;
  }>({
    subject: "",
    body: "",
    audience: "all",
    channel: "in_app",
  });
  const [recent, setRecent] = useState<AppNotification[]>([]);
  const [sending, setSending] = useState(false);
  const [loadingRecent, setLoadingRecent] = useState(true);

  const loadRecent = useCallback(async () => {
    setLoadingRecent(true);
    try {
      // Admin sees their own inbox sample; broadcast creates per-user rows.
      setRecent(await fetchMyNotifications({ limit: 20 }));
    } catch {
      setRecent([]);
    } finally {
      setLoadingRecent(false);
    }
  }, []);

  useEffect(() => {
    void loadRecent();
  }, [loadRecent]);

  return (
    <PermissionGate permission="notifications.send">
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <div className="rounded-2xl border bg-card p-5">
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
              <Mail className="h-4 w-4" /> Compose system notification
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Audience</Label>
                <Select
                  value={form.audience}
                  onValueChange={(v) => setForm({ ...form, audience: v as NotificationAudience })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All users</SelectItem>
                    <SelectItem value="students">Students</SelectItem>
                    <SelectItem value="teachers">Teachers</SelectItem>
                    <SelectItem value="parents">Parents</SelectItem>
                    <SelectItem value="admins">Admins</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Channel</Label>
                <Select
                  value={form.channel}
                  onValueChange={(v) => setForm({ ...form, channel: v as NotificationChannel })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_app">In-app</SelectItem>
                    <SelectItem value="email">Email (SMTP — config only)</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-3">
              <Label>Subject</Label>
              <Input
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="System maintenance, new feature, course alert..."
              />
            </div>
            <div className="mt-3">
              <Label>Body</Label>
              <Textarea
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                className="min-h-[140px]"
                placeholder="Message body — supports plain text."
              />
            </div>
            {form.channel !== "in_app" && !smtp.enabled && (
              <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-900/20 dark:text-amber-200">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  SMTP delivery is disabled. In-app notifications still send. Enable SMTP in the panel
                  for email later.
                </span>
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <Button
                disabled={sending}
                onClick={() => {
                  void (async () => {
                    if (!form.subject || !form.body) return toast.error("Subject and body required");
                    setSending(true);
                    try {
                      const result = await sendBroadcastNotification({
                        title: form.subject.trim(),
                        body: form.body.trim(),
                        audience: form.audience,
                      });
                      toast.success(
                        `In-app notification created for ${result.created?.toLocaleString?.() ?? result.created} users`,
                      );
                      setForm({ subject: "", body: "", audience: form.audience, channel: form.channel });
                      void loadRecent();
                    } catch (e) {
                      toast.error(formatApiErrorMessage(e, "Could not send notification"));
                    } finally {
                      setSending(false);
                    }
                  })();
                }}
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send
                notification
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <h3 className="mb-3 font-display font-bold">Your recent notifications</h3>
            {loadingRecent ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">No notifications in your inbox yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Read</TableHead>
                    <TableHead>When</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recent.map((n) => (
                    <TableRow key={n.id}>
                      <TableCell className="font-medium">{n.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {n.type || "system"}
                        </Badge>
                      </TableCell>
                      <TableCell>{n.read ? "Yes" : "No"}</TableCell>
                      <TableCell className="text-xs">
                        {n.createdAt ? new Date(n.createdAt).toLocaleString() : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        <div className="h-fit rounded-2xl border bg-card p-5">
          <h3 className="mb-3 flex items-center gap-2 font-display font-bold">
            <Server className="h-4 w-4" /> SMTP configuration
          </h3>
          <p className="mb-4 text-xs text-muted-foreground">
            Mail SMTP setup for system alerts & updates (stored locally until a mail service is wired).
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <div className="text-sm font-medium">Enable SMTP</div>
                <div className="text-xs text-muted-foreground">Toggle outbound email</div>
              </div>
              <Switch checked={smtp.enabled} onCheckedChange={(v) => updateSmtp({ enabled: v })} />
            </div>
            <div>
              <Label>Host</Label>
              <Input value={smtp.host} onChange={(e) => updateSmtp({ host: e.target.value })} />
            </div>
            <div>
              <Label>Port</Label>
              <Input
                value={String(smtp.port)}
                onChange={(e) => updateSmtp({ port: Number(e.target.value) || 587 })}
              />
            </div>
            <div>
              <Label>From email</Label>
              <Input value={smtp.fromEmail} onChange={(e) => updateSmtp({ fromEmail: e.target.value })} />
            </div>
          </div>
        </div>
      </div>
    </PermissionGate>
  );
}

/* ============ Earnings ============ */
export function EarningsPanel() {
  const totals = useMemo(() => ({
    gross: 184_240,
    net: 162_180,
    pendingPayouts: 22_060,
    payouts: 138_900,
  }), []);

  return (
    <PermissionGate permission="earnings.view">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Gross revenue (MTD)", value: `$${totals.gross.toLocaleString()}` },
          { label: "Net (after fees)", value: `$${totals.net.toLocaleString()}` },
          { label: "Pending payouts", value: `$${totals.pendingPayouts.toLocaleString()}` },
          { label: "Paid out (MTD)", value: `$${totals.payouts.toLocaleString()}` },
        ].map((s) => (
          <div key={s.label} className="bg-card border rounded-2xl p-4">
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className="text-2xl font-display font-extrabold mt-1">{s.value}</div>
          </div>
        ))}
      </div>
      <div className="bg-card border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold">Tutor payouts queue</h3>
          <PermissionGate permission="earnings.payout" fallback={<Badge variant="outline" className="text-xs">View only</Badge>}>
            <Button size="sm" onClick={() => toast.success("Batch payout initiated")}>Run payout batch</Button>
          </PermissionGate>
        </div>
        <Table>
          <TableHeader><TableRow><TableHead>Tutor</TableHead><TableHead>Earnings</TableHead><TableHead>Period</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>
            {[
              { name: "Ahmed Rahman", amount: 4820, period: "Apr 2026", status: "Pending" },
              { name: "Lina Park", amount: 7610, period: "Apr 2026", status: "Pending" },
              { name: "Neha Singh", amount: 3240, period: "Mar 2026", status: "Paid" },
            ].map((r) => (
              <TableRow key={r.name}>
                <TableCell>{r.name}</TableCell>
                <TableCell>${r.amount.toLocaleString()}</TableCell>
                <TableCell>{r.period}</TableCell>
                <TableCell><Badge className={r.status === "Paid" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"}>{r.status}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </PermissionGate>
  );
}
