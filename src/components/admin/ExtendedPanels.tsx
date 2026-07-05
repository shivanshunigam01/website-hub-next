"use client";

import { useCallback, useEffect, useState } from "react";
import { api, formatApiErrorMessage } from "@/lib/api";
import {
  Mail, Server, Send, FileText, ListChecks, ShieldCheck, Globe2, BarChart3,
  CheckCircle2, XCircle, Clock, AlertTriangle, DollarSign, Search, Download,
  Smartphone, WifiOff, HardDrive, Lock, ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  useAdminRequirements,
  useApproveRequirementAdmin,
  useRejectRequirementAdmin,
} from "@/hooks/use-requirements-api";
import { formatPrice } from "@/lib/currencies";
import { requirementStatusClass } from "@/lib/tutor-jobs-utils";
import { useMarketplace, type Listing } from "@/hooks/use-marketplace";
import { PermissionGate } from "@/components/admin/Panels";
import { ApprovedImageThumbnail, pickApprovedImageUrl } from "@/components/ui/ApprovedImageThumbnail";

/* =====================================================================
 * 1. MAIL SETTINGS PANEL  (SMTP + Templates + Logs — UI only)
 * ===================================================================== */

const ENCRYPTION_OPTIONS = ["none", "ssl", "tls", "starttls"] as const;

type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  body: string;
};

const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: "welcome",
    name: "Welcome email",
    subject: "Welcome to TeacherPoint, {{name}}",
    body: "Hi {{name}},\n\nWelcome aboard! Explore courses and tutors tailored to your goals.\n\n— Team TeacherPoint",
  },
  {
    id: "req-posted",
    name: "Requirement posted",
    subject: "Your requirement is live",
    body: "Hi {{name}},\n\nWe received your tutoring requirement. It is now in admin review.",
  },
  {
    id: "admin-approve",
    name: "Admin approval",
    subject: "Your requirement was approved",
    body: "Good news — your requirement is approved and visible to verified tutors.",
  },
  {
    id: "teacher-proposal",
    name: "Teacher proposal",
    subject: "A tutor has sent you a proposal",
    body: "{{teacherName}} responded to your requirement with a tailored proposal.",
  },
  {
    id: "payment-success",
    name: "Payment success",
    subject: "Payment received — receipt #{{paymentId}}",
    body: "Thank you! Your payment of {{amount}} was successful.",
  },
  {
    id: "contact-unlocked",
    name: "Contact unlocked",
    subject: "Tutor contact unlocked",
    body: "You can now reach {{teacherName}} directly via phone, email or WhatsApp.",
  },
  {
    id: "marketplace-approval",
    name: "Student Exchange listing approval",
    subject: "Your listing is live",
    body: "Your Student Exchange listing {{title}} has been approved and is now live.",
  },
  {
    id: "support-ticket",
    name: "Support ticket update",
    subject: "Update on your support ticket {{ticketId}}",
    body: "Our team has responded to your support ticket. Please check the support center.",
  },
];

type EmailLog = {
  id: string;
  to: string;
  template: string;
  status: "sent" | "failed" | "pending";
  at: string;
};

const SEED_LOGS: EmailLog[] = [
  { id: "log-1", to: "aarav@example.com", template: "Welcome email", status: "sent", at: "2 min ago" },
  { id: "log-2", to: "priya@example.com", template: "Requirement posted", status: "sent", at: "12 min ago" },
  { id: "log-3", to: "emma@example.com", template: "Teacher proposal", status: "pending", at: "20 min ago" },
  { id: "log-4", to: "bad@nodomain", template: "Payment success", status: "failed", at: "1 hr ago" },
];

type ApiSmtpResponse = {
  config: {
    host?: string;
    port?: number;
    secure?: boolean;
    user?: string;
    fromName?: string;
    fromEmail?: string;
    isActive?: boolean;
  } | null;
  status: { configured: boolean; source?: string | null; fromEmail?: string | null };
};

export function MailSettingsPanel() {
  const [smtp, setSmtp] = useState({
    host: "smtp.gmail.com",
    port: 587,
    username: "",
    password: "",
    fromEmail: "",
    fromName: "TeacherPoint",
    encryption: "tls" as (typeof ENCRYPTION_OPTIONS)[number],
    enabled: true,
  });
  const [smtpSource, setSmtpSource] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testTo, setTestTo] = useState("");
  const [sending, setSending] = useState(false);
  const [tab, setTab] = useState<"smtp" | "templates" | "logs">("smtp");
  const [templates, setTemplates] = useState<EmailTemplate[]>(DEFAULT_TEMPLATES);
  const [activeTpl, setActiveTpl] = useState<string>(DEFAULT_TEMPLATES[0].id);
  const [logFilter, setLogFilter] = useState<"all" | EmailLog["status"]>("all");
  const logs = SEED_LOGS.filter((l) => logFilter === "all" || l.status === logFilter);
  const tpl = templates.find((t) => t.id === activeTpl)!;

  const updateSmtp = (patch: Partial<typeof smtp>) => setSmtp((s) => ({ ...s, ...patch }));
  const updateTemplate = (patch: Partial<EmailTemplate>) =>
    setTemplates((ts) => ts.map((t) => (t.id === activeTpl ? { ...t, ...patch } : t)));

  const loadSmtp = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<ApiSmtpResponse>("/admin/smtp-config");
      setSmtpSource(data.status?.source ?? null);
      const c = data.config;
      if (c) {
        setSmtp({
          host: c.host || "smtp.gmail.com",
          port: c.port ?? 587,
          username: c.user || "",
          password: "",
          fromEmail: c.fromEmail || c.user || "",
          fromName: c.fromName || "TeacherPoint",
          encryption: c.secure ? "ssl" : "tls",
          enabled: c.isActive !== false,
        });
      }
    } catch (e) {
      toast.error(formatApiErrorMessage(e, "Failed to load SMTP settings"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSmtp();
  }, [loadSmtp]);

  const saveSmtp = async () => {
    setSaving(true);
    try {
      const data = await api<ApiSmtpResponse>("/admin/smtp-config", {
        method: "PATCH",
        body: JSON.stringify({
          host: smtp.host,
          port: smtp.port,
          secure: smtp.encryption === "ssl",
          user: smtp.username,
          pass: smtp.password || undefined,
          fromName: smtp.fromName,
          fromEmail: smtp.fromEmail,
          isActive: smtp.enabled,
        }),
      });
      setSmtpSource(data.status?.source ?? null);
      toast.success("SMTP saved — welcome emails will use this on production");
      setSmtp((s) => ({ ...s, password: "" }));
    } catch (e) {
      toast.error(formatApiErrorMessage(e, "Failed to save SMTP"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <PermissionGate permission="settings.manage">
      <div className="space-y-5">
        <div className="bg-card border rounded-2xl p-5">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <div>
              <h2 className="font-display font-bold text-lg flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" /> Mail settings
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Configure SMTP for production welcome emails (student &amp; teacher signup). Server{" "}
                <code className="text-[10px]">.env</code> overrides this when{" "}
                <code className="text-[10px]">SMTP_USER</code> is set.
                {smtpSource && (
                  <span className="block mt-1 text-primary font-medium">
                    Active source: {smtpSource}
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              {(["smtp", "templates", "logs"] as const).map((k) => (
                <Button
                  key={k}
                  size="sm"
                  variant={tab === k ? "default" : "outline"}
                  onClick={() => setTab(k)}
                  className="capitalize"
                >
                  {k === "smtp" ? "SMTP" : k === "templates" ? "Templates" : "Logs"}
                </Button>
              ))}
            </div>
          </div>

          {tab === "smtp" && (
            <div className="grid lg:grid-cols-[1fr_320px] gap-5">
              {loading ? (
                <p className="text-sm text-muted-foreground col-span-2 py-8 text-center">Loading SMTP…</p>
              ) : (
                <>
              <div className="space-y-3">
                <div className="flex items-center justify-between border rounded-lg p-3">
                  <div>
                    <div className="text-sm font-medium flex items-center gap-2"><Server className="h-4 w-4" /> SMTP delivery</div>
                    <div className="text-xs text-muted-foreground">{smtp.enabled ? "Enabled — signup welcome emails active" : "Disabled — welcome emails will not send"}</div>
                  </div>
                  <Switch checked={smtp.enabled} onCheckedChange={(v) => updateSmtp({ enabled: v })} />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div><Label>SMTP host</Label><Input value={smtp.host} onChange={(e) => updateSmtp({ host: e.target.value })} /></div>
                  <div><Label>SMTP port</Label><Input type="number" value={smtp.port} onChange={(e) => updateSmtp({ port: Number(e.target.value) })} /></div>
                  <div><Label>Username (Gmail address)</Label><Input value={smtp.username} onChange={(e) => updateSmtp({ username: e.target.value })} /></div>
                  <div><Label>App password</Label><Input type="password" placeholder="Leave blank to keep existing" value={smtp.password} onChange={(e) => updateSmtp({ password: e.target.value })} /></div>
                  <div><Label>From email</Label><Input value={smtp.fromEmail} onChange={(e) => updateSmtp({ fromEmail: e.target.value })} /></div>
                  <div><Label>From name</Label><Input value={smtp.fromName} onChange={(e) => updateSmtp({ fromName: e.target.value })} /></div>
                  <div className="sm:col-span-2">
                    <Label>Encryption</Label>
                    <Select value={smtp.encryption} onValueChange={(v) => updateSmtp({ encryption: v as typeof smtp.encryption })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ENCRYPTION_OPTIONS.map((o) => (
                          <SelectItem key={o} value={o} className="capitalize">{o.toUpperCase()}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={saveSmtp} disabled={saving}>
                  {saving ? "Saving…" : "Save SMTP to production"}
                </Button>
              </div>

              <div className="border rounded-xl p-4 bg-muted/30 h-fit">
                <h3 className="font-semibold text-sm mb-2 flex items-center gap-2"><Send className="h-4 w-4" /> Send test email</h3>
                <p className="text-xs text-muted-foreground mb-3">Sends a real message through the production API.</p>
                <Input placeholder="recipient@example.com" value={testTo} onChange={(e) => setTestTo(e.target.value)} className="mb-2" />
                <Button
                  className="w-full"
                  disabled={!testTo || sending}
                  onClick={async () => {
                    setSending(true);
                    try {
                      const res = await api<{ sent: boolean; reason?: string }>("/admin/smtp-config/test", {
                        method: "POST",
                        body: JSON.stringify({ to: testTo }),
                      });
                      if (res.sent) toast.success(`Test email sent to ${testTo}`);
                      else toast.error(res.reason || "SMTP not configured on server");
                    } catch (e) {
                      toast.error(formatApiErrorMessage(e, "Test email failed"));
                    } finally {
                      setSending(false);
                    }
                  }}
                >
                  {sending ? "Sending…" : "Send test email"}
                </Button>
              </div>
                </>
              )}
            </div>
          )}

          {tab === "templates" && (
            <div className="grid lg:grid-cols-[260px_1fr] gap-5">
              <div className="border rounded-xl divide-y bg-muted/20">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTpl(t.id)}
                    className={`w-full text-left p-3 text-sm hover:bg-muted/60 transition ${
                      activeTpl === t.id ? "bg-primary/10 font-semibold" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-primary" /> {t.name}
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{t.subject}</div>
                  </button>
                ))}
              </div>
              <div className="space-y-3">
                <div><Label>Template name</Label><Input value={tpl.name} onChange={(e) => updateTemplate({ name: e.target.value })} /></div>
                <div><Label>Subject</Label><Input value={tpl.subject} onChange={(e) => updateTemplate({ subject: e.target.value })} /></div>
                <div>
                  <Label>Body (supports merge tokens like <code className="text-xs">{"{{name}}"}</code>)</Label>
                  <Textarea value={tpl.body} onChange={(e) => updateTemplate({ body: e.target.value })} className="min-h-[200px] font-mono text-xs" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setTemplates(DEFAULT_TEMPLATES)}>Reset all</Button>
                  <Button onClick={() => toast.success("Template saved")}>Save template</Button>
                </div>
              </div>
            </div>
          )}

          {tab === "logs" && (
            <div>
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <h3 className="font-semibold text-sm flex items-center gap-2"><ListChecks className="h-4 w-4" /> Delivery logs</h3>
                <div className="flex gap-2">
                  {(["all", "sent", "failed", "pending"] as const).map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant={logFilter === s ? "default" : "outline"}
                      onClick={() => setLogFilter(s)}
                      className="capitalize"
                    >
                      {s} ({s === "all" ? SEED_LOGS.length : SEED_LOGS.filter((l) => l.status === s).length})
                    </Button>
                  ))}
                </div>
              </div>
              <Table>
                <TableHeader><TableRow><TableHead>Recipient</TableHead><TableHead>Template</TableHead><TableHead>Status</TableHead><TableHead>Sent</TableHead></TableRow></TableHeader>
                <TableBody>
                  {logs.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="text-sm">{l.to}</TableCell>
                      <TableCell className="text-sm">{l.template}</TableCell>
                      <TableCell>
                        {l.status === "sent" && <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"><CheckCircle2 className="h-3 w-3 mr-1" />Sent</Badge>}
                        {l.status === "failed" && <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>}
                        {l.status === "pending" && <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pending</Badge>}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{l.at}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </PermissionGate>
  );
}

/* =====================================================================
 * 2. REQUIREMENTS APPROVAL PANEL
 * ===================================================================== */

export function RequirementsApprovalPanel() {
  const { data: pending = [], isLoading: pendingLoading } = useAdminRequirements("pending");
  const { data: open = [] } = useAdminRequirements("open");
  const { data: rejected = [] } = useAdminRequirements("rejected");
  const approveMut = useApproveRequirementAdmin();
  const rejectMut = useRejectRequirementAdmin();
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("Does not meet posting guidelines");

  const decided = [...open, ...rejected].slice(0, 20);

  const handleApprove = async (id: string) => {
    try {
      const result = await approveMut.mutateAsync({ id, adminRemark: "Approved" });
      toast.success(
        result.emailSent
          ? "Approved — student notified by email"
          : "Approved — visible on tutor jobs",
      );
    } catch (err) {
      toast.error(formatApiErrorMessage(err, "Could not approve"));
    }
  };

  const handleReject = async () => {
    if (!rejectId || rejectNote.trim().length < 3) {
      toast.error("Enter a rejection reason (min 3 characters)");
      return;
    }
    try {
      await rejectMut.mutateAsync({ id: rejectId, adminRemark: rejectNote.trim() });
      toast.success("Requirement rejected");
      setRejectId(null);
      setRejectNote("Does not meet posting guidelines");
    } catch (err) {
      toast.error(formatApiErrorMessage(err, "Could not reject"));
    }
  };

  return (
    <PermissionGate permission="courses.approve">
      <div className="space-y-5">
        <div className="bg-card border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg">Pending requirement approvals ({pending.length})</h2>
            <Badge variant="outline">Queue</Badge>
          </div>
          {pendingLoading ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Loading…</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead className="text-right">Review</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pending.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                      No pending requirements.
                    </TableCell>
                  </TableRow>
                )}
                {pending.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="font-medium">{r.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{r.details}</div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {r.studentName}
                      <div className="text-xs text-muted-foreground">{r.studentEmail}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{r.jobType}</Badge>
                    </TableCell>
                    <TableCell><Badge variant="outline">{r.subject}</Badge></TableCell>
                    <TableCell className="text-sm">{formatPrice(r.budget, r.currency)}/hr</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={rejectMut.isPending}
                        onClick={() => {
                          setRejectId(r.id);
                          setRejectNote("Does not meet posting guidelines");
                        }}
                      >
                        <XCircle className="h-4 w-4" /> Reject
                      </Button>
                      <Button
                        size="sm"
                        className="ml-2"
                        disabled={approveMut.isPending}
                        onClick={() => handleApprove(r.id)}
                      >
                        <CheckCircle2 className="h-4 w-4" /> Approve
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {rejectId && (
          <div className="bg-card border rounded-2xl p-5">
            <h3 className="font-display font-bold mb-3">Reject requirement</h3>
            <Textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              rows={3}
              placeholder="Reason shown internally…"
            />
            <div className="mt-3 flex gap-2">
              <Button variant="outline" onClick={() => setRejectId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={handleReject} disabled={rejectMut.isPending}>
                Confirm reject
              </Button>
            </div>
          </div>
        )}

        <div className="bg-card border rounded-2xl p-5">
          <h2 className="font-display font-bold text-lg mb-4">Recent decisions</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {decided.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                    No decisions yet.
                  </TableCell>
                </TableRow>
              )}
              {decided.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.title}</TableCell>
                  <TableCell>
                    <Badge className={requirementStatusClass(r.status)}>{r.status}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{r.adminNote ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </PermissionGate>
  );
}

/* =====================================================================
 * 3. MARKETPLACE APPROVAL PANEL
 * ===================================================================== */

export function MarketplaceApprovalPanel() {
  const { listings, updateListing } = useMarketplace();
  const [filter, setFilter] = useState<"all" | Listing["status"]>("pending");
  const filtered = filter === "all" ? listings : listings.filter((l) => l.status === filter);
  const pendingCount = listings.filter((l) => l.status === "pending").length;

  return (
    <PermissionGate permission="courses.approve">
      <div className="bg-card border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h2 className="font-display font-bold text-lg">Student Exchange listings ({listings.length})</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Approve student posts before they appear on /marketplace.
              {pendingCount > 0 && (
                <span className="ms-1 font-medium text-amber-600">{pendingCount} pending</span>
              )}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {(["all", "pending", "active", "rejected", "sold", "expired"] as const).map((s) => (
              <Button key={s} size="sm" variant={filter === s ? "default" : "outline"} onClick={() => setFilter(s)} className="capitalize">
                {s}
              </Button>
            ))}
          </div>
        </div>
        <Table>
          <TableHeader><TableRow><TableHead className="w-[72px]">Image</TableHead><TableHead>Listing</TableHead><TableHead>Seller</TableHead><TableHead>Category</TableHead><TableHead>Price</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-6">No listings in this view.</TableCell></TableRow>}
            {filtered.map((l) => (
              <TableRow key={l.id}>
                <TableCell>
                  <ApprovedImageThumbnail
                    approvedImageUrl={pickApprovedImageUrl(l)}
                    alt={l.title}
                  />
                </TableCell>
                <TableCell><div className="font-medium line-clamp-1">{l.title}</div><div className="text-xs text-muted-foreground">{l.city}, {l.country}</div></TableCell>
                <TableCell className="text-sm">{l.sellerName}<div className="text-xs text-muted-foreground capitalize">{l.sellerRole}</div></TableCell>
                <TableCell><Badge variant="outline" className="capitalize">{l.category}</Badge></TableCell>
                <TableCell className="text-sm">{l.currency} {l.price}</TableCell>
                <TableCell>
                  <Badge className={
                    l.status === "active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                    : l.status === "pending" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                    : l.status === "rejected" ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                    : "bg-muted text-muted-foreground"
                  }>{l.status}</Badge>
                </TableCell>
                <TableCell className="text-right space-x-1">
                  {l.status === "pending" && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => { updateListing(l.id, { status: "active" }); toast.success("Listing approved — now live on Student Exchange"); }}>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { updateListing(l.id, { status: "rejected" }); toast.success("Listing rejected"); }}>
                        <XCircle className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </>
                  )}
                  {l.status === "active" && (
                    <Button size="sm" variant="outline" onClick={() => { updateListing(l.id, { status: "expired" }); toast.success("Listing taken down"); }}>
                      <XCircle className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </PermissionGate>
  );
}

/* =====================================================================
 * 4. SEO SETTINGS PANEL
 * ===================================================================== */

export function SeoSettingsPanel() {
  const [pages, setPages] = useState([
    { route: "/", title: "TeacherPoint — Find the best tutors and online courses", description: "Trusted edtech marketplace for tutors, courses and student services." },
    { route: "/courses", title: "Browse Courses · TeacherPoint", description: "Discover top-rated online courses across subjects." },
    { route: "/tutors", title: "Find a Tutor · TeacherPoint", description: "Search verified tutors by subject, location, rating and price." },
    { route: "/marketplace", title: "Student Exchange · TeacherPoint", description: "Buy and sell study materials, services and accommodations." },
  ]);
  const [analytics, setAnalytics] = useState({ ga: "G-XXXXXXX", pixel: "" });

  return (
    <PermissionGate permission="settings.manage">
      <div className="space-y-5">
        <div className="bg-card border rounded-2xl p-5">
          <h2 className="font-display font-bold text-lg flex items-center gap-2 mb-1"><Search className="h-5 w-5" /> SEO settings</h2>
          <p className="text-xs text-muted-foreground mb-4">Edit meta titles & descriptions per route. (UI only — wires to your CMS later.)</p>
          <div className="space-y-3">
            {pages.map((p, i) => (
              <div key={p.route} className="border rounded-xl p-3 grid sm:grid-cols-[120px_1fr] gap-3 items-start">
                <Badge variant="outline" className="font-mono text-xs">{p.route}</Badge>
                <div className="space-y-2">
                  <Input value={p.title} onChange={(e) => setPages((ps) => ps.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} placeholder="Meta title" />
                  <Textarea value={p.description} onChange={(e) => setPages((ps) => ps.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)))} placeholder="Meta description" rows={2} />
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-3"><Button onClick={() => toast.success("SEO settings saved (mock)")}>Save SEO</Button></div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-card border rounded-2xl p-5">
            <h3 className="font-semibold flex items-center gap-2 mb-3"><Globe2 className="h-4 w-4" /> Robots & sitemap</h3>
            <pre className="bg-muted/40 rounded-lg p-3 text-xs overflow-auto">{`User-agent: *
Allow: /
Disallow: /admin
Disallow: /student
Disallow: /teacher
Sitemap: /sitemap.xml`}</pre>
            <Button asChild variant="outline" size="sm" className="mt-3"><a href="/sitemap.xml" target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5" /> Open sitemap</a></Button>
          </div>
          <div className="bg-card border rounded-2xl p-5">
            <h3 className="font-semibold flex items-center gap-2 mb-3"><BarChart3 className="h-4 w-4" /> Analytics</h3>
            <div className="space-y-3">
              <div><Label>Google Analytics ID</Label><Input value={analytics.ga} onChange={(e) => setAnalytics({ ...analytics, ga: e.target.value })} placeholder="G-XXXXXXX" /></div>
              <div><Label>Facebook Pixel ID</Label><Input value={analytics.pixel} onChange={(e) => setAnalytics({ ...analytics, pixel: e.target.value })} placeholder="1234567890" /></div>
              <Button variant="outline" onClick={() => toast.success("Analytics IDs saved (mock)")}>Save IDs</Button>
            </div>
          </div>
        </div>
      </div>
    </PermissionGate>
  );
}

/* =====================================================================
 * 5. REVENUE DASHBOARD
 * ===================================================================== */

const TUTOR_COMMISSIONS = [
  { name: "Emma Carter", revenue: 12400, commission: 1860, courses: 8 },
  { name: "Ahmed Rahman", revenue: 9820, commission: 1473, courses: 6 },
  { name: "Lina Park", revenue: 18600, commission: 2790, courses: 12 },
  { name: "Neha Singh", revenue: 7430, commission: 1115, courses: 5 },
  { name: "Diego Alvarez", revenue: 6120, commission: 918, courses: 4 },
];

export function RevenueDashboardPanel() {
  return (
    <PermissionGate permission="earnings.view">
      <div className="space-y-5">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Gross revenue (MTD)", value: "$184,240", trend: "+18%" },
            { label: "Platform commission", value: "$27,636", trend: "+12%" },
            { label: "Tutor payouts", value: "$156,604", trend: "+19%" },
            { label: "Refunds", value: "$1,840", trend: "−4%" },
          ].map((s) => (
            <div key={s.label} className="bg-card border rounded-2xl p-4">
              <div className="text-xs text-muted-foreground">{s.label}</div>
              <div className="text-2xl font-display font-extrabold mt-1">{s.value}</div>
              <div className="text-xs text-emerald-600 mt-0.5">{s.trend}</div>
            </div>
          ))}
        </div>

        <div className="bg-card border rounded-2xl p-5">
          <h3 className="font-display font-bold mb-3">Tutor-wise commission analysis</h3>
          <Table>
            <TableHeader><TableRow><TableHead>Tutor</TableHead><TableHead>Courses</TableHead><TableHead>Revenue</TableHead><TableHead>Commission</TableHead><TableHead>%</TableHead></TableRow></TableHeader>
            <TableBody>
              {TUTOR_COMMISSIONS.map((t) => (
                <TableRow key={t.name}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell>{t.courses}</TableCell>
                  <TableCell>${t.revenue.toLocaleString()}</TableCell>
                  <TableCell>${t.commission.toLocaleString()}</TableCell>
                  <TableCell>{((t.commission / t.revenue) * 100).toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="bg-card border rounded-2xl p-5">
          <h3 className="font-display font-bold mb-3 flex items-center gap-2"><DollarSign className="h-4 w-4" /> Payment providers</h3>
          <p className="text-xs text-muted-foreground mb-4">UI placeholders — backend integration handled separately.</p>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { name: "Stripe", desc: "Cards & wallets" },
              { name: "Razorpay", desc: "India payments" },
              { name: "PayPal", desc: "Global payouts" },
            ].map((p) => (
              <div key={p.name} className="border rounded-xl p-4 bg-muted/20">
                <div className="font-semibold">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.desc}</div>
                <Badge variant="outline" className="mt-3 text-xs">Not connected</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PermissionGate>
  );
}

/* =====================================================================
 * 6. PWA / SECURITY CHECKLIST
 * ===================================================================== */

export function PwaSecurityPanel() {
  const checks = [
    { label: "HTTPS / SSL enabled", ok: true, icon: Lock, note: "Auto-provisioned by hosting" },
    { label: "Web App Manifest", ok: true, icon: Smartphone, note: "/manifest.webmanifest" },
    { label: "Offline fallback screen", ok: true, icon: WifiOff, note: "/offline route ready" },
    { label: "Install prompt UI", ok: true, icon: Download, note: "Custom prompt mounted" },
    { label: "Automated DB backups", ok: false, icon: HardDrive, note: "Backend wiring pending" },
    { label: "DB access policies (RLS)", ok: false, icon: ShieldCheck, note: "Backend wiring pending" },
    { label: "Robots.txt + sitemap.xml", ok: true, icon: Search, note: "Live" },
  ];

  return (
    <PermissionGate permission="settings.manage">
      <div className="space-y-5">
        <div className="bg-card border rounded-2xl p-5">
          <h2 className="font-display font-bold text-lg flex items-center gap-2 mb-1">
            <ShieldCheck className="h-5 w-5 text-primary" /> Hosting & security checklist
          </h2>
          <p className="text-xs text-muted-foreground mb-4">Launch-readiness snapshot. Items marked pending will be wired during backend setup.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {checks.map((c) => (
              <div key={c.label} className="border rounded-xl p-4 flex items-start gap-3">
                <div className={`grid place-items-center h-10 w-10 rounded-xl shrink-0 ${c.ok ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"}`}>
                  <c.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm flex items-center gap-2">{c.label}
                    {c.ok ? <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">OK</Badge>
                          : <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">Pending</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{c.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-5">
          <h3 className="font-display font-bold mb-3 flex items-center gap-2"><Smartphone className="h-4 w-4" /> PWA install prompt</h3>
          <div className="border rounded-xl p-4 flex items-start gap-3 bg-muted/30">
            <div className="grid place-items-center h-12 w-12 rounded-xl bg-primary/10 text-primary"><Download className="h-5 w-5" /></div>
            <div className="flex-1">
              <div className="font-semibold">Install TeacherPoint</div>
              <div className="text-xs text-muted-foreground">Get an app-like experience on your home screen.</div>
            </div>
            <Button size="sm" onClick={() => toast.info("Install prompt is shown on supported browsers")}>Install</Button>
          </div>
          <div className="mt-3 text-xs text-muted-foreground flex items-start gap-2">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-500" />
            Real install + offline support require deploying with a service worker. UI is in place.
          </div>
        </div>
      </div>
    </PermissionGate>
  );
}
