"use client";

import { useEffect, useMemo, useState } from "react";
import { LayoutDashboard, Users, BookOpen, Package, DollarSign, Plus, Pencil, Trash2, Settings, BarChart3, Megaphone, Building2, Mail, ShieldCheck, LifeBuoy, CheckSquare, Flag, Bell, Network, FileText, ShoppingBag, Mail as MailIcon, TrendingUp, Search as SearchIcon, Smartphone, Presentation, GraduationCap, Briefcase } from "lucide-react";
import { IpMonitorPanel } from "@/components/admin/IpMonitorPanel";
import { DashboardShell, StatCard } from "@/components/dashboard/Shell";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { UsersPanel } from "@/components/admin/UsersPanel";
import { RegionalContentPanel } from "@/components/admin/RegionalContentPanel";
import { useAdminStore } from "@/hooks/use-admin-store";
import { useApp } from "@/hooks/use-app";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SelectWithOther } from "@/components/ui/SelectWithOther";
import { REVENUE_DATA } from "@/data/mock";
import { courseImage, tutorImage } from "@/data/images";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { toast } from "sonner";
import type { Course, Tutor } from "@/types/catalog";
import type { Combo, Accommodation, AccommodationType, AccommodationGender, AccommodationInquiry } from "@/hooks/use-admin-store";
import { Switch } from "@/components/ui/switch";
import { usePlatformStore } from "@/hooks/use-platform-store";
import { useAdminPermission } from "@/hooks/use-admin-permissions";
import { TeamPanel, TicketsPanel, ApprovalsPanel, ReportsPanel, NotificationsPanel, EarningsPanel, AdminRoleSwitcher, PermissionGate } from "@/components/admin/Panels";
import {
  MailSettingsPanel,
  RequirementsApprovalPanel,
  MarketplaceApprovalPanel,
  SeoSettingsPanel,
  RevenueDashboardPanel,
  PwaSecurityPanel,
} from "@/components/admin/ExtendedPanels";
import { JobApplicationsApprovalPanel } from "@/components/admin/JobApplicationsApprovalPanel";
import { WorkshopsAdminPanel } from "@/components/admin/WorkshopsAdminPanel";
import { SubjectsAdminPanel } from "@/components/admin/SubjectsAdminPanel";
import { AccommodationInquiriesPanel } from "@/components/admin/AccommodationInquiriesPanel";
import { UserIpSummary } from "@/components/admin/IpAddressCell";

const ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "users", label: "Users", icon: Users },
  { id: "ip-monitor", label: "Same IP Users", icon: Network },
  { id: "team", label: "Team & Roles", icon: ShieldCheck },
  { id: "approvals", label: "Course Approvals", icon: CheckSquare },
  { id: "workshops", label: "Workshop Requests", icon: Presentation },
  { id: "requirements", label: "Requirement Approvals", icon: FileText },
  { id: "job-applications", label: "Job Applications", icon: Briefcase },
  { id: "marketplace", label: "Exchange Approvals", icon: ShoppingBag },
  { id: "tickets", label: "Support Tickets", icon: LifeBuoy },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "mail", label: "Mail Settings", icon: MailIcon },
  { id: "reports", label: "User Reports", icon: Flag },
  { id: "earnings", label: "Earnings", icon: DollarSign },
  { id: "revenuepro", label: "Revenue Pro", icon: TrendingUp },
  { id: "courses", label: "Courses", icon: BookOpen },
  { id: "subjects", label: "Subjects", icon: GraduationCap },
  { id: "teachers", label: "Teachers", icon: Users },
  { id: "packages", label: "Packages", icon: Package },
  { id: "accommodations", label: "Accommodations", icon: Building2 },
  { id: "inquiries", label: "Inquiries", icon: Mail },
  { id: "ads", label: "Geo CMS", icon: Megaphone },
  { id: "revenue", label: "Revenue", icon: BarChart3 },
  { id: "seo", label: "SEO Settings", icon: SearchIcon },
  { id: "pwa", label: "PWA & Security", icon: Smartphone },
  { id: "settings", label: "Settings", icon: Settings },
];

function Admin() {
  const store = useAdminStore();
  const platform = usePlatformStore();
  const { user } = useApp();
  const { canAccessTab } = useAdminPermission();
  const [tab, setTab] = useState<string>("overview");

  const visibleItems = useMemo(
    () => ITEMS.filter((item) => canAccessTab(item.id)),
    [canAccessTab],
  );

  useEffect(() => {
    if (!canAccessTab(tab)) setTab("overview");
  }, [tab, canAccessTab]);

  return (
    <RequireAuth roles={["admin"]}>
    <DashboardShell items={visibleItems} title="Admin" activeSection={tab} onSectionChange={setTab}>
      {user && (
        <div className="mb-4 space-y-2">
          <p className="text-sm text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{user.email}</span>
          </p>
          <UserIpSummary
            registrationIp={user.registrationIp}
            lastLoginIp={user.lastLoginIp}
            lastLoginAt={user.lastLoginAt}
          />
        </div>
      )}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-extrabold text-2xl">Manage your platform</h1>
          <p className="text-xs text-muted-foreground mt-1">Role-based control across users, courses, earnings & content.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <AdminRoleSwitcher />
          <Button variant="outline" size="sm" onClick={() => { store.reset(); toast.success("Data reset to defaults"); }}>
            Reset to defaults
          </Button>
        </div>
      </div>

      {tab === "overview" && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            <StatCard label="Pending approvals" value={String(platform.submissions.filter((s) => s.status === "pending").length)} icon={CheckSquare} color="from-amber-400 to-orange-500" />
            <StatCard label="Open tickets" value={String(platform.tickets.filter((t) => t.status === "open").length)} icon={LifeBuoy} color="from-rose-400 to-pink-600" />
            <StatCard label="User reports" value={String(platform.reports.filter((r) => r.status === "open").length)} icon={Flag} color="from-red-400 to-rose-600" />
            <StatCard label="Admins" value={String(platform.team.filter((m) => m.active).length)} icon={ShieldCheck} color="from-indigo-400 to-purple-600" />
            <StatCard label="Courses" value={String(store.courses.length)} icon={BookOpen} />
            <StatCard label="Revenue (MTD)" value="$184K" change="+18%" icon={DollarSign} color="from-emerald-400 to-teal-600" />
          </div>
          <div className="bg-card border rounded-2xl p-6 text-sm text-muted-foreground">
            Welcome back, <span className="font-medium text-foreground">{platform.currentAdmin?.name}</span>. You are signed in as
            <Badge variant="outline" className="mx-1 capitalize">{platform.currentAdmin?.role.replace("_", " ")}</Badge>.
            Choose a section from the sidebar to manage your platform.
          </div>
          <button
            type="button"
            onClick={() => setTab("ads")}
            className="mt-4 w-full text-left bg-gradient-to-br from-primary/10 via-card to-card border rounded-2xl p-5 hover:border-primary/40 transition"
          >
            <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wide">
              <Megaphone className="h-4 w-4" /> Geo CMS — enabled
            </div>
            <h3 className="font-display font-bold text-lg mt-2">Location-based content personalization</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Upload banners, images, and videos by country or city. Content is matched to each visitor&apos;s IP/GPS location automatically.
            </p>
            <span className="inline-block mt-3 text-sm font-semibold text-primary">Open Geo CMS →</span>
          </button>
        </>
      )}

      {tab === "team" && <TeamPanel />}
      {tab === "approvals" && <ApprovalsPanel />}
      {tab === "workshops" && (
        <PermissionGate permission="courses.approve">
          <WorkshopsAdminPanel />
        </PermissionGate>
      )}
      {tab === "requirements" && <RequirementsApprovalPanel />}
      {tab === "job-applications" && <JobApplicationsApprovalPanel />}
      {tab === "marketplace" && <MarketplaceApprovalPanel />}
      {tab === "tickets" && <TicketsPanel />}
      {tab === "notifications" && <NotificationsPanel />}
      {tab === "mail" && <MailSettingsPanel />}
      {tab === "reports" && <ReportsPanel />}
      {tab === "earnings" && <EarningsPanel />}
      {tab === "revenuepro" && <RevenueDashboardPanel />}
      {tab === "seo" && <SeoSettingsPanel />}
      {tab === "pwa" && <PwaSecurityPanel />}

      {tab === "users" && <UsersPanel />}
      {tab === "ip-monitor" && <IpMonitorPanel />}

      {tab === "courses" && <PermissionGate permission="courses.manage"><CoursesPanel /></PermissionGate>}
      {tab === "subjects" && (
        <PermissionGate permission="courses.manage">
          <SubjectsAdminPanel />
        </PermissionGate>
      )}
      {tab === "teachers" && <PermissionGate permission="users.manage"><TeachersPanel /></PermissionGate>}
      {tab === "packages" && <PermissionGate permission="courses.manage"><PackagesPanel /></PermissionGate>}
      {tab === "accommodations" && <PermissionGate permission="courses.manage"><AccommodationsPanel /></PermissionGate>}
      {tab === "inquiries" && (
        <PermissionGate permission="tickets.manage">
          <AccommodationInquiriesPanel />
        </PermissionGate>
      )}
      {tab === "ads" && <PermissionGate permission="ads.manage"><RegionalContentPanel /></PermissionGate>}
      {tab === "revenue" && <PermissionGate permission="earnings.view"><RevenuePanel /></PermissionGate>}
      {tab === "settings" && (
        <PermissionGate permission="settings.manage">
          <div className="bg-card border rounded-2xl p-8 text-center text-muted-foreground">
            Platform settings — coming soon.
          </div>
        </PermissionGate>
      )}
    </DashboardShell>
    </RequireAuth>
  );
}


/* ---------------- Courses ---------------- */

function CoursesPanel() {
  const { courses, addCourse, updateCourse, deleteCourse } = useAdminStore();
  const [editing, setEditing] = useState<Course | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-card border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h2 className="font-display font-bold">All courses ({courses.length})</h2>
        <Button size="sm" onClick={() => { addCourse({}); toast.success("Course added — edit it below"); }}>
          <Plus className="h-4 w-4" /> Add course
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Students</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <div className="flex items-center gap-3 min-w-[220px]">
                    <img src={(c as any).image || courseImage(c.id)} alt="" className="h-10 w-14 rounded object-cover" />
                    <div>
                      <div className="font-semibold text-sm line-clamp-1">{c.title}</div>
                      <div className="text-xs text-muted-foreground">{c.instructor}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell><Badge variant="secondary">{c.category}</Badge></TableCell>
                <TableCell className="text-sm">{c.level}</TableCell>
                <TableCell className="font-semibold">${c.price}<span className="text-xs text-muted-foreground line-through ml-1">${c.oldPrice}</span></TableCell>
                <TableCell className="text-sm">{c.students.toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <Button size="icon" variant="ghost" onClick={() => { setEditing(c); setOpen(true); }} aria-label="Edit"><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => { deleteCourse(c.id); toast.success("Course deleted"); }} aria-label="Delete"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CourseEditDialog
        open={open && !!editing}
        course={editing}
        onClose={() => { setOpen(false); setEditing(null); }}
        onSave={(patch) => { if (editing) { updateCourse(editing.id, patch); toast.success("Course updated"); } setOpen(false); setEditing(null); }}
      />
    </div>
  );
}

function CourseEditDialog({ open, course, onClose, onSave }: { open: boolean; course: Course | null; onClose: () => void; onSave: (p: Partial<Course>) => void }) {
  const [form, setForm] = useState<Partial<Course>>({});
  const update = (k: keyof Course, v: any) => setForm((f) => ({ ...f, [k]: v }));
  // Re-seed form when course changes
  if (course && form.id !== course.id) setForm({ ...course });

  if (!course) return null;
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Edit course</DialogTitle></DialogHeader>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2"><Label>Title</Label><Input value={form.title || ""} onChange={(e) => update("title", e.target.value)} /></div>
          <div className="sm:col-span-2"><Label>Description</Label><Textarea rows={3} value={form.description || ""} onChange={(e) => update("description", e.target.value)} /></div>
          <div><Label>Instructor</Label><Input value={form.instructor || ""} onChange={(e) => update("instructor", e.target.value)} /></div>
          <div><Label>Category</Label><Input value={form.category || ""} onChange={(e) => update("category", e.target.value)} /></div>
          <div><Label>Level</Label>
            <SelectWithOther
              options={["Beginner", "Intermediate", "Advanced"]}
              value={form.level || ""}
              onValueChange={(v) => update("level", v)}
              otherPlaceholder="Enter course level"
            />
          </div>
          <div><Label>Language</Label><Input value={form.language || ""} onChange={(e) => update("language", e.target.value)} /></div>
          <div><Label>Price ($)</Label><Input type="number" value={form.price ?? 0} onChange={(e) => update("price", Number(e.target.value))} /></div>
          <div><Label>Old price ($)</Label><Input type="number" value={form.oldPrice ?? 0} onChange={(e) => update("oldPrice", Number(e.target.value))} /></div>
          <div><Label>Duration</Label><Input value={form.duration || ""} onChange={(e) => update("duration", e.target.value)} /></div>
          <div><Label>Lessons</Label><Input type="number" value={form.lessons ?? 0} onChange={(e) => update("lessons", Number(e.target.value))} /></div>
          <div><Label>Students</Label><Input type="number" value={form.students ?? 0} onChange={(e) => update("students", Number(e.target.value))} /></div>
          <div><Label>Rating</Label><Input type="number" step="0.1" value={form.rating ?? 0} onChange={(e) => update("rating", Number(e.target.value))} /></div>
          <div className="sm:col-span-2"><Label>Image URL (optional)</Label><Input value={(form as any).image || ""} onChange={(e) => update("image" as any, e.target.value)} placeholder="https://..." /></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(form)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Teachers ---------------- */

function TeachersPanel() {
  const { tutors, addTutor, updateTutor, deleteTutor } = useAdminStore();
  const [editing, setEditing] = useState<Tutor | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-card border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h2 className="font-display font-bold">All teachers ({tutors.length})</h2>
        <Button size="sm" onClick={() => { addTutor({}); toast.success("Teacher added — edit details"); }}>
          <Plus className="h-4 w-4" /> Add teacher
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Teacher</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Rate/hr</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tutors.map((t) => (
              <TableRow key={t.id}>
                <TableCell>
                  <div className="flex items-center gap-3 min-w-[200px]">
                    <img src={(t as any).image || tutorImage(t.id)} alt="" className="h-10 w-10 rounded-full object-cover" />
                    <div>
                      <div className="font-semibold text-sm">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.location}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{t.subject}</TableCell>
                <TableCell className="font-semibold">${t.price}</TableCell>
                <TableCell className="text-sm">⭐ {t.rating}</TableCell>
                <TableCell>
                  {t.verified
                    ? <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">Yes</Badge>
                    : <Badge variant="secondary">No</Badge>}
                </TableCell>
                <TableCell className="text-right">
                  <Button size="icon" variant="ghost" onClick={() => { setEditing(t); setOpen(true); }} aria-label="Edit"><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => { deleteTutor(t.id); toast.success("Teacher removed"); }} aria-label="Delete"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <TeacherEditDialog
        open={open && !!editing}
        tutor={editing}
        onClose={() => { setOpen(false); setEditing(null); }}
        onSave={(patch) => { if (editing) { updateTutor(editing.id, patch); toast.success("Teacher updated"); } setOpen(false); setEditing(null); }}
      />
    </div>
  );
}

function TeacherEditDialog({ open, tutor, onClose, onSave }: { open: boolean; tutor: Tutor | null; onClose: () => void; onSave: (p: Partial<Tutor>) => void }) {
  const [form, setForm] = useState<Partial<Tutor>>({});
  const update = (k: keyof Tutor, v: any) => setForm((f) => ({ ...f, [k]: v }));
  if (tutor && form.id !== tutor.id) setForm({ ...tutor });

  if (!tutor) return null;
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Edit teacher</DialogTitle></DialogHeader>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><Label>Name</Label><Input value={form.name || ""} onChange={(e) => update("name", e.target.value)} /></div>
          <div><Label>Subject</Label><Input value={form.subject || ""} onChange={(e) => update("subject", e.target.value)} /></div>
          <div><Label>Location</Label><Input value={form.location || ""} onChange={(e) => update("location", e.target.value)} /></div>
          <div><Label>Experience (years)</Label><Input type="number" value={form.experience ?? 0} onChange={(e) => update("experience", Number(e.target.value))} /></div>
          <div><Label>Rate $/hr</Label><Input type="number" value={form.price ?? 0} onChange={(e) => update("price", Number(e.target.value))} /></div>
          <div><Label>Rating</Label><Input type="number" step="0.1" value={form.rating ?? 0} onChange={(e) => update("rating", Number(e.target.value))} /></div>
          <div><Label>Reviews</Label><Input type="number" value={form.reviews ?? 0} onChange={(e) => update("reviews", Number(e.target.value))} /></div>
          <div><Label>Availability</Label><Input value={form.availability || ""} onChange={(e) => update("availability", e.target.value)} /></div>
          <div><Label>Verified</Label>
            <Select value={String(!!form.verified)} onValueChange={(v) => update("verified", v === "true")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Online</Label>
            <Select value={String(!!form.online)} onValueChange={(v) => update("online", v === "true")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2"><Label>Bio (about teacher)</Label><Textarea rows={3} value={form.bio || ""} onChange={(e) => update("bio", e.target.value)} /></div>
          <div className="sm:col-span-2"><Label>Photo URL (optional)</Label><Input value={(form as any).image || ""} onChange={(e) => update("image" as any, e.target.value)} placeholder="https://..." /></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(form)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Packages ---------------- */

function PackagesPanel() {
  const { combos, addCombo, updateCombo, deleteCombo } = useAdminStore();
  const [editing, setEditing] = useState<Combo | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-card border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h2 className="font-display font-bold">Course packages ({combos.length})</h2>
        <Button size="sm" onClick={() => { addCombo({}); toast.success("Package added"); }}>
          <Plus className="h-4 w-4" /> Add package
        </Button>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {combos.map((k) => (
          <div key={k.id} className="border rounded-2xl overflow-hidden bg-card">
            <div className="h-2" style={{ background: k.gradient }} />
            <div className="p-4">
              <div className="font-semibold">{k.title}</div>
              <div className="text-xs text-muted-foreground mt-1">{k.courses} courses · {k.hours}h</div>
              <div className="mt-2 flex items-end gap-2">
                <span className="font-bold text-lg">${k.price}</span>
                <span className="text-xs line-through text-muted-foreground">${k.oldPrice}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-2 line-clamp-2">{k.includes.join(" · ")}</div>
              <div className="mt-3 flex gap-2 justify-end">
                <Button size="icon" variant="ghost" onClick={() => { setEditing(k); setOpen(true); }} aria-label="Edit"><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => { deleteCombo(k.id); toast.success("Package removed"); }} aria-label="Delete"><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ComboEditDialog
        open={open && !!editing}
        combo={editing}
        onClose={() => { setOpen(false); setEditing(null); }}
        onSave={(patch) => { if (editing) { updateCombo(editing.id, patch); toast.success("Package updated"); } setOpen(false); setEditing(null); }}
      />
    </div>
  );
}

function ComboEditDialog({ open, combo, onClose, onSave }: { open: boolean; combo: Combo | null; onClose: () => void; onSave: (p: Partial<Combo>) => void }) {
  const [form, setForm] = useState<Partial<Combo>>({});
  const update = (k: keyof Combo, v: any) => setForm((f) => ({ ...f, [k]: v }));
  if (combo && form.id !== combo.id) setForm({ ...combo, includes: [...combo.includes] });

  if (!combo) return null;
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Edit package</DialogTitle></DialogHeader>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2"><Label>Title</Label><Input value={form.title || ""} onChange={(e) => update("title", e.target.value)} /></div>
          <div><Label>Courses</Label><Input type="number" value={form.courses ?? 0} onChange={(e) => update("courses", Number(e.target.value))} /></div>
          <div><Label>Hours</Label><Input type="number" value={form.hours ?? 0} onChange={(e) => update("hours", Number(e.target.value))} /></div>
          <div><Label>Price ($)</Label><Input type="number" value={form.price ?? 0} onChange={(e) => update("price", Number(e.target.value))} /></div>
          <div><Label>Old price ($)</Label><Input type="number" value={form.oldPrice ?? 0} onChange={(e) => update("oldPrice", Number(e.target.value))} /></div>
          <div className="sm:col-span-2"><Label>Includes (comma separated)</Label>
            <Input
              value={(form.includes || []).join(", ")}
              onChange={(e) => update("includes", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(form)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Revenue ---------------- */

function RevenuePanel() {
  return (
    <div className="bg-card border rounded-2xl p-5">
      <h2 className="font-display font-bold mb-4">Revenue & payouts</h2>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={REVENUE_DATA}>
            <defs>
              <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" fontSize={12} stroke="currentColor" className="text-muted-foreground" />
            <YAxis fontSize={12} stroke="currentColor" className="text-muted-foreground" />
            <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
            <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#rg)" />
            <Area type="monotone" dataKey="payouts" stroke="#10b981" fill="url(#pg)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ---------------- Accommodations ---------------- */

function AccommodationsPanel() {
  const { accommodations, addAccommodation, updateAccommodation, deleteAccommodation } = useAdminStore();
  const [editing, setEditing] = useState<Accommodation | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-card border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h2 className="font-display font-bold">Accommodations ({accommodations.length})</h2>
        <Button size="sm" onClick={() => { addAccommodation({}); toast.success("Accommodation added — edit details"); }}>
          <Plus className="h-4 w-4" /> Add stay
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Price/mo</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Available</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accommodations.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-semibold text-sm">{a.name}</TableCell>
                <TableCell><Badge variant="secondary">{a.type}</Badge></TableCell>
                <TableCell className="text-sm">{a.city}, {a.country}</TableCell>
                <TableCell className="font-semibold">{a.currency} {a.pricePerMonth.toLocaleString()}</TableCell>
                <TableCell className="text-sm capitalize">{a.gender}</TableCell>
                <TableCell>
                  {a.available
                    ? <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">Yes</Badge>
                    : <Badge variant="secondary">No</Badge>}
                </TableCell>
                <TableCell className="text-right">
                  <Button size="icon" variant="ghost" onClick={() => { setEditing(a); setOpen(true); }} aria-label="Edit"><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => { deleteAccommodation(a.id); toast.success("Accommodation removed"); }} aria-label="Delete"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AccommodationEditDialog
        open={open && !!editing}
        item={editing}
        onClose={() => { setOpen(false); setEditing(null); }}
        onSave={(patch) => { if (editing) { updateAccommodation(editing.id, patch); toast.success("Accommodation updated"); } setOpen(false); setEditing(null); }}
      />
    </div>
  );
}

function AccommodationEditDialog({ open, item, onClose, onSave }: { open: boolean; item: Accommodation | null; onClose: () => void; onSave: (p: Partial<Accommodation>) => void }) {
  const [form, setForm] = useState<Partial<Accommodation>>({});
  const update = (k: keyof Accommodation, v: any) => setForm((f) => ({ ...f, [k]: v }));
  if (item && form.id !== item.id) setForm({ ...item });
  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Edit accommodation</DialogTitle></DialogHeader>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2"><Label>Name</Label><Input value={form.name || ""} onChange={(e) => update("name", e.target.value)} /></div>
          <div><Label>Type</Label>
            <SelectWithOther
              mode="enum-other"
              otherEnumValue="Other"
              options={[
                { value: "PG", label: "PG" },
                { value: "Hostel", label: "Hostel" },
                { value: "Apartment", label: "Apartment" },
                { value: "Shared Room", label: "Shared Room" },
              ]}
              value={form.type || ""}
              customValue={form.typeOther || ""}
              onValueChange={(v) => update("type", v as AccommodationType)}
              onCustomValueChange={(v) => update("typeOther", v)}
              otherPlaceholder="Specify accommodation type"
            />
          </div>
          <div><Label>Gender</Label>
            <SelectWithOther
              mode="enum-other"
              options={[
                { value: "boys", label: "Boys" },
                { value: "girls", label: "Girls" },
                { value: "co-ed", label: "Co-ed" },
              ]}
              value={form.gender || ""}
              customValue={form.genderOther || ""}
              onValueChange={(v) => update("gender", v as AccommodationGender)}
              onCustomValueChange={(v) => update("genderOther", v)}
              otherPlaceholder="Specify gender preference"
            />
          </div>
          <div><Label>City</Label><Input value={form.city || ""} onChange={(e) => update("city", e.target.value)} /></div>
          <div><Label>Country</Label><Input value={form.country || ""} onChange={(e) => update("country", e.target.value)} /></div>
          <div className="sm:col-span-2"><Label>Address</Label><Input value={form.address || ""} onChange={(e) => update("address", e.target.value)} /></div>
          <div><Label>Price / month</Label><Input type="number" value={form.pricePerMonth ?? 0} onChange={(e) => update("pricePerMonth", Number(e.target.value))} /></div>
          <div><Label>Currency</Label><Input value={form.currency || ""} onChange={(e) => update("currency", e.target.value)} placeholder="INR, USD, AED" /></div>
          <div><Label>Rating</Label><Input type="number" step="0.1" value={form.rating ?? 0} onChange={(e) => update("rating", Number(e.target.value))} /></div>
          <div><Label>Distance to campus</Label><Input value={form.distanceToCampus || ""} onChange={(e) => update("distanceToCampus", e.target.value)} /></div>
          <div><Label>Contact phone</Label><Input value={form.contactPhone || ""} onChange={(e) => update("contactPhone", e.target.value)} /></div>
          <div><Label>Contact email</Label><Input value={form.contactEmail || ""} onChange={(e) => update("contactEmail", e.target.value)} /></div>
          <div className="sm:col-span-2"><Label>Amenities (comma separated)</Label>
            <Input
              value={(form.amenities || []).join(", ")}
              onChange={(e) => update("amenities", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
              placeholder="wifi, meals, ac, laundry, security"
            />
          </div>
          <div className="sm:col-span-2"><Label>Image URL</Label><Input value={form.imageUrl || ""} onChange={(e) => update("imageUrl", e.target.value)} placeholder="https://..." /></div>
          <div className="sm:col-span-2"><Label>Description</Label><Textarea rows={3} value={form.description || ""} onChange={(e) => update("description", e.target.value)} /></div>
          <div className="flex items-center gap-3"><Switch checked={!!form.available} onCheckedChange={(v) => update("available", v)} /><Label className="!m-0">Available</Label></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(form)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Inquiries ---------------- */

function InquiriesPanel() {
  const { inquiries, updateInquiry, deleteInquiry } = useAdminStore();

  return (
    <div className="bg-card border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h2 className="font-display font-bold">Accommodation inquiries ({inquiries.length})</h2>
      </div>
      {inquiries.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">No inquiries yet. Student submissions will appear here.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Interested in</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Received</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inquiries.map((q) => (
                <TableRow key={q.id}>
                  <TableCell>
                    <div className="font-semibold text-sm">{q.studentName}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2 max-w-[260px]">{q.message}</div>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div>{q.email}</div>
                    {q.phone && <div className="text-xs text-muted-foreground">{q.phone}</div>}
                  </TableCell>
                  <TableCell className="text-sm">{q.accommodationName || "—"}</TableCell>
                  <TableCell className="text-sm">{[q.city, q.country].filter(Boolean).join(", ") || "—"}</TableCell>
                  <TableCell>
                    <Select value={q.status} onValueChange={(v) => updateInquiry(q.id, { status: v as AccommodationInquiry["status"] })}>
                      <SelectTrigger className="h-8 w-[130px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(q.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => { deleteInquiry(q.id); toast.success("Inquiry deleted"); }} aria-label="Delete"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}



export default Admin;
