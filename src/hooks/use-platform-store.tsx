"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

// ============ Types ============
export type AdminRole = "super_admin" | "manager" | "moderator";

export const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  super_admin: [
    "users.manage", "earnings.view", "earnings.payout", "ads.manage",
    "courses.approve", "courses.manage", "reports.view", "reports.resolve",
    "tickets.manage", "team.manage", "notifications.send", "settings.manage",
  ],
  manager: [
    "users.manage", "earnings.view", "ads.manage", "courses.approve",
    "courses.manage", "reports.view", "reports.resolve", "tickets.manage",
    "notifications.send",
  ],
  moderator: [
    "courses.approve", "reports.view", "tickets.manage",
  ],
};

export type AdminMember = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  active: boolean;
  createdAt: string;
  lastActiveAt?: string;
};

export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketStatus = "open" | "in_progress" | "waiting" | "resolved" | "closed";
export type TicketCategory = "account" | "payments" | "course" | "tutor" | "technical" | "other";
export type TicketAuthorRole = "student" | "teacher" | "parent" | "guest" | "admin";

export type TicketMessage = {
  id: string;
  author: string;
  authorRole: TicketAuthorRole;
  message: string;
  createdAt: string;
};

export type SupportTicket = {
  id: string;
  subject: string;
  description: string;
  category: TicketCategory;
  categoryOther?: string;
  priority: TicketPriority;
  status: TicketStatus;
  requesterName: string;
  requesterEmail: string;
  requesterRole: TicketAuthorRole;
  assigneeId?: string;
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
};

export type CourseSubmissionStatus = "pending" | "approved" | "rejected";
export type CourseSubmission = {
  id: string;
  title: string;
  instructor: string;
  category: string;
  price: number;
  submittedAt: string;
  status: CourseSubmissionStatus;
  reviewNote?: string;
  reviewedBy?: string;
};

export type UserReportReason = "spam" | "harassment" | "inappropriate" | "fraud" | "copyright" | "other";
export type UserReportStatus = "open" | "investigating" | "actioned" | "dismissed";
export type UserReport = {
  id: string;
  targetType: "user" | "course" | "tutor" | "review";
  targetName: string;
  reportedBy: string;
  reason: UserReportReason;
  details: string;
  status: UserReportStatus;
  createdAt: string;
  resolvedNote?: string;
};

export type NotificationChannel = "email" | "in_app" | "both";
export type NotificationAudience = "all" | "students" | "teachers" | "parents" | "admins";
export type SystemNotification = {
  id: string;
  subject: string;
  body: string;
  channel: NotificationChannel;
  audience: NotificationAudience;
  sentBy: string;
  sentAt: string;
  recipientsCount: number;
  status: "queued" | "sent" | "failed";
  error?: string;
};

export type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  passwordMasked: string;
  fromName: string;
  fromEmail: string;
  enabled: boolean;
};

export type CurrentAdmin = { id: string; role: AdminRole } | null;

type State = {
  team: AdminMember[];
  tickets: SupportTicket[];
  submissions: CourseSubmission[];
  reports: UserReport[];
  notifications: SystemNotification[];
  smtp: SmtpConfig;
  currentAdminId: string;
};

type PlatformStore = State & {
  currentAdmin: AdminMember | undefined;
  hasPermission: (perm: string) => boolean;
  setCurrentAdmin: (id: string) => void;

  // team
  addMember: (m: Omit<AdminMember, "id" | "createdAt" | "active">) => void;
  updateMember: (id: string, patch: Partial<AdminMember>) => void;
  deleteMember: (id: string) => void;

  // tickets
  createTicket: (t: Omit<SupportTicket, "id" | "createdAt" | "updatedAt" | "status" | "messages"> & { firstMessage?: string }) => SupportTicket;
  updateTicket: (id: string, patch: Partial<SupportTicket>) => void;
  replyTicket: (id: string, msg: Omit<TicketMessage, "id" | "createdAt">) => void;
  deleteTicket: (id: string) => void;

  // submissions
  reviewSubmission: (id: string, decision: "approved" | "rejected", note: string, reviewer: string) => void;
  addSubmission: (s: Omit<CourseSubmission, "id" | "submittedAt" | "status">) => void;

  // reports
  updateReport: (id: string, patch: Partial<UserReport>) => void;

  // notifications
  sendNotification: (n: Omit<SystemNotification, "id" | "sentAt" | "status" | "recipientsCount"> & { recipientsCount?: number }) => SystemNotification;
  updateSmtp: (patch: Partial<SmtpConfig>) => void;

  reset: () => void;
};

const KEY = "tp_platform_store_v1";
const Ctx = createContext<PlatformStore | null>(null);
const rid = (p: string) => p + Math.random().toString(36).slice(2, 8);
const now = () => new Date().toISOString();

const initial = (): State => ({
  currentAdminId: "adm-1",
  team: [
    { id: "adm-1", name: "Aarav Mehta", email: "aarav@teacherpoint.org", role: "super_admin", active: true, createdAt: now(), lastActiveAt: now() },
    { id: "adm-2", name: "Priya Sharma", email: "priya@teacherpoint.org", role: "manager", active: true, createdAt: now() },
    { id: "adm-3", name: "Omar Khalid", email: "omar@teacherpoint.org", role: "moderator", active: true, createdAt: now() },
  ],
  tickets: [
    {
      id: "TCK-1001",
      subject: "Unable to access purchased course",
      description: "After payment confirmation I still don't see the course in my dashboard.",
      category: "payments",
      priority: "high",
      status: "open",
      requesterName: "Riya Verma",
      requesterEmail: "riya@example.com",
      requesterRole: "student",
      messages: [{ id: "m1", author: "Riya Verma", authorRole: "student", message: "Please help — paid yesterday.", createdAt: now() }],
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: "TCK-1002",
      subject: "Schedule conflict with student",
      description: "Need to reschedule a recurring class.",
      category: "tutor",
      priority: "medium",
      status: "in_progress",
      requesterName: "James O'Connor",
      requesterEmail: "james@example.com",
      requesterRole: "teacher",
      assigneeId: "adm-3",
      messages: [{ id: "m1", author: "James O'Connor", authorRole: "teacher", message: "Looking for help to reschedule.", createdAt: now() }],
      createdAt: now(),
      updatedAt: now(),
    },
  ],
  submissions: [
    { id: "sub-1", title: "Advanced React Patterns 2026", instructor: "Lina Park", category: "Development", price: 79, submittedAt: now(), status: "pending" },
    { id: "sub-2", title: "IELTS Speaking Mastery", instructor: "Ahmed Rahman", category: "Languages", price: 49, submittedAt: now(), status: "pending" },
    { id: "sub-3", title: "Class 10 Maths — Full Syllabus", instructor: "Neha Singh", category: "K12", price: 39, submittedAt: now(), status: "approved", reviewedBy: "adm-1" },
  ],
  reports: [
    { id: "rep-1", targetType: "review", targetName: "Review on 'Python Basics'", reportedBy: "tutor-12", reason: "spam", details: "Likely fake review with promo links.", status: "open", createdAt: now() },
    { id: "rep-2", targetType: "user", targetName: "@suspicious_user", reportedBy: "student-44", reason: "harassment", details: "Sending abusive DMs.", status: "investigating", createdAt: now() },
  ],
  notifications: [
    { id: "ntf-1", subject: "Welcome to TeacherPoint!", body: "Thanks for joining. Explore courses and tutors.", channel: "email", audience: "all", sentBy: "adm-1", sentAt: now(), recipientsCount: 12480, status: "sent" },
  ],
  smtp: {
    host: "smtp.mailgun.org",
    port: 587,
    secure: true,
    username: "postmaster@mg.teacherpoint.org",
    passwordMasked: "••••••••",
    fromName: "TeacherPoint",
    fromEmail: "no-reply@teacherpoint.org",
    enabled: true,
  },
});

function parse(raw: string): State {
  try {
    const p = JSON.parse(raw) as Partial<State>;
    const base = initial();
    return {
      currentAdminId: p.currentAdminId ?? base.currentAdminId,
      team: p.team?.length ? p.team : base.team,
      tickets: p.tickets ?? base.tickets,
      submissions: p.submissions ?? base.submissions,
      reports: p.reports ?? base.reports,
      notifications: p.notifications ?? base.notifications,
      smtp: { ...base.smtp, ...(p.smtp ?? {}) },
    };
  } catch { return initial(); }
}

export function PlatformStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initial);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(KEY);
    if (raw) setState(parse(raw));
  }, []);

  const persist = (next: State) => {
    setState(next);
    if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(next));
  };

  const currentAdmin = state.team.find((m) => m.id === state.currentAdminId);
  const hasPermission = (perm: string) => {
    if (!currentAdmin || !currentAdmin.active) return false;
    return ROLE_PERMISSIONS[currentAdmin.role].includes(perm);
  };

  const value: PlatformStore = {
    ...state,
    currentAdmin,
    hasPermission,
    setCurrentAdmin: (id) => persist({ ...state, currentAdminId: id }),

    addMember: (m) =>
      persist({
        ...state,
        team: [{ id: rid("adm-"), createdAt: now(), active: true, ...m }, ...state.team],
      }),
    updateMember: (id, patch) =>
      persist({ ...state, team: state.team.map((t) => (t.id === id ? { ...t, ...patch } : t)) }),
    deleteMember: (id) =>
      persist({ ...state, team: state.team.filter((t) => t.id !== id) }),

    createTicket: (t) => {
      const ticket: SupportTicket = {
        id: "TCK-" + Math.floor(1000 + Math.random() * 9000),
        createdAt: now(),
        updatedAt: now(),
        status: "open",
        messages: t.firstMessage
          ? [{ id: rid("m"), author: t.requesterName, authorRole: t.requesterRole, message: t.firstMessage, createdAt: now() }]
          : [],
        subject: t.subject,
        description: t.description,
        category: t.category,
        categoryOther: t.categoryOther,
        priority: t.priority,
        requesterName: t.requesterName,
        requesterEmail: t.requesterEmail,
        requesterRole: t.requesterRole,
        assigneeId: t.assigneeId,
      };
      persist({ ...state, tickets: [ticket, ...state.tickets] });
      return ticket;
    },
    updateTicket: (id, patch) =>
      persist({
        ...state,
        tickets: state.tickets.map((tk) => (tk.id === id ? { ...tk, ...patch, updatedAt: now() } : tk)),
      }),
    replyTicket: (id, msg) =>
      persist({
        ...state,
        tickets: state.tickets.map((tk) =>
          tk.id === id
            ? { ...tk, messages: [...tk.messages, { id: rid("m"), createdAt: now(), ...msg }], updatedAt: now() }
            : tk
        ),
      }),
    deleteTicket: (id) =>
      persist({ ...state, tickets: state.tickets.filter((t) => t.id !== id) }),

    reviewSubmission: (id, decision, note, reviewer) =>
      persist({
        ...state,
        submissions: state.submissions.map((s) =>
          s.id === id ? { ...s, status: decision, reviewNote: note, reviewedBy: reviewer } : s
        ),
      }),
    addSubmission: (s) =>
      persist({
        ...state,
        submissions: [{ id: rid("sub-"), submittedAt: now(), status: "pending", ...s }, ...state.submissions],
      }),

    updateReport: (id, patch) =>
      persist({
        ...state,
        reports: state.reports.map((r) => (r.id === id ? { ...r, ...patch } : r)),
      }),

    sendNotification: (n) => {
      const notif: SystemNotification = {
        id: rid("ntf-"),
        sentAt: now(),
        status: state.smtp.enabled || n.channel === "in_app" ? "sent" : "failed",
        error: state.smtp.enabled || n.channel === "in_app" ? undefined : "SMTP disabled",
        recipientsCount: n.recipientsCount ?? estimateAudience(n.audience),
        ...n,
      };
      persist({ ...state, notifications: [notif, ...state.notifications] });
      return notif;
    },
    updateSmtp: (patch) => persist({ ...state, smtp: { ...state.smtp, ...patch } }),

    reset: () => persist(initial()),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

function estimateAudience(a: NotificationAudience) {
  switch (a) {
    case "all": return 12480;
    case "students": return 8420;
    case "teachers": return 1640;
    case "parents": return 2380;
    case "admins": return 40;
  }
}

export function usePlatformStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("usePlatformStore must be used within PlatformStoreProvider");
  return v;
}
