"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

/**
 * UI-only state for the requirement → proposal → payment → contact-unlock flow.
 * All mutations are mock; no network calls. All function names ending with `Mock`
 * are placeholders for the future Node/Express API.
 */

export type RequirementStatus = "pending" | "approved" | "rejected" | "fulfilled";
export type ProposalStatus = "pending" | "selected" | "declined";
export type PaymentStatus = "unpaid" | "processing" | "paid" | "failed";

export type Requirement = {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  subject: string;
  level: string;
  mode: "online" | "offline" | "both";
  budget: number;
  city: string;
  details: string;
  status: RequirementStatus;
  createdAt: string;
  adminNote?: string;
};

export type Proposal = {
  id: string;
  requirementId: string;
  teacherId: string;
  teacherName: string;
  message: string;
  rate: number;
  sessions: number;
  status: ProposalStatus;
  createdAt: string;
};

export type PaymentRecord = {
  id: string;
  proposalId: string;
  requirementId: string;
  amount: number;
  status: PaymentStatus;
  method: "card" | "upi" | "wallet";
  createdAt: string;
};

type State = {
  requirements: Requirement[];
  proposals: Proposal[];
  payments: PaymentRecord[];
  /** key: `${requirementId}:${teacherId}` -> true when contact is unlocked */
  unlockedContacts: Record<string, boolean>;
};

type Store = State & {
  createRequirementPostMock: (
    r: Omit<Requirement, "id" | "createdAt" | "status">,
  ) => Promise<Requirement>;
  approveRequirementMock: (id: string, note?: string) => Promise<void>;
  rejectRequirementMock: (id: string, note?: string) => Promise<void>;
  createTeacherProposalMock: (
    p: Omit<Proposal, "id" | "createdAt" | "status">,
  ) => Promise<Proposal>;
  createPaymentMock: (proposalId: string) => Promise<PaymentRecord>;
  unlockTeacherContactMock: (requirementId: string, teacherId: string) => Promise<void>;
  isContactUnlocked: (requirementId: string, teacherId: string) => boolean;
  reset: () => void;
};

const KEY = "tp_requirements_v2";
const Ctx = createContext<Store | null>(null);
const rid = (p: string) => p + Math.random().toString(36).slice(2, 8);
const now = () => new Date().toISOString();

const SEED: State = {
  requirements: [
    {
      id: "req-1",
      studentId: "stu-aarav",
      studentName: "Aarav P.",
      title: "Class 10 Math tutor for board exams",
      subject: "Mathematics",
      level: "High school",
      mode: "online",
      budget: 30,
      city: "Mumbai, India",
      details: "Need help with algebra and geometry, 3x per week, evenings.",
      status: "approved",
      createdAt: now(),
    },
    {
      id: "req-2",
      studentId: "stu-priya",
      studentName: "Priya S.",
      title: "IELTS speaking practice",
      subject: "English",
      level: "Professional",
      mode: "online",
      budget: 25,
      city: "Bangalore, India",
      details: "Looking for daily 30-min speaking practice for 4 weeks.",
      status: "pending",
      createdAt: now(),
    },
    {
      id: "req-3",
      studentId: "stu-rahul",
      studentName: "Rahul K.",
      title: "Home tutor for Class 8 Science",
      subject: "Science",
      level: "Middle school",
      mode: "offline",
      budget: 22,
      city: "Delhi, India",
      details: "In-person tutor needed at our home in South Delhi, twice a week after school.",
      status: "approved",
      createdAt: now(),
    },
    {
      id: "req-4",
      studentId: "stu-emma",
      studentName: "Emma L.",
      title: "Python + Data Science mentor",
      subject: "Computer Science",
      level: "College / University",
      mode: "both",
      budget: 40,
      city: "Hyderabad, India",
      details: "Flexible online or weekend in-person sessions for a final-year project.",
      status: "approved",
      createdAt: now(),
    },
    {
      id: "req-5",
      studentId: "stu-david",
      studentName: "David M.",
      title: "NEET Biology crash course",
      subject: "Biology",
      level: "High school",
      mode: "online",
      budget: 35,
      city: "Online",
      details: "Intensive 6-week online prep for NEET with weekly mock tests.",
      status: "approved",
      createdAt: now(),
    },
    {
      id: "req-6",
      studentId: "stu-sara",
      studentName: "Sara T.",
      title: "Piano lessons at home",
      subject: "Music",
      level: "Beginner",
      mode: "offline",
      budget: 28,
      city: "Pune, India",
      details: "Looking for a patient home tutor for my 10-year-old, weekends preferred.",
      status: "approved",
      createdAt: now(),
    },
  ],
  proposals: [
    {
      id: "prop-1",
      requirementId: "req-1",
      teacherId: "t1",
      teacherName: "Emma Carter",
      message: "I specialize in CBSE board prep. Happy to schedule a free trial.",
      rate: 28,
      sessions: 3,
      status: "pending",
      createdAt: now(),
    },
  ],
  payments: [],
  unlockedContacts: {},
};

export function RequirementsStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(SEED);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  const createRequirementPostMock: Store["createRequirementPostMock"] = async (r) => {
    const created: Requirement = {
      ...r,
      id: rid("req-"),
      createdAt: now(),
      status: "pending",
    };
    setState((s) => ({ ...s, requirements: [created, ...s.requirements] }));
    return created;
  };

  const approveRequirementMock: Store["approveRequirementMock"] = async (id, note) => {
    setState((s) => ({
      ...s,
      requirements: s.requirements.map((r) =>
        r.id === id ? { ...r, status: "approved", adminNote: note } : r,
      ),
    }));
  };

  const rejectRequirementMock: Store["rejectRequirementMock"] = async (id, note) => {
    setState((s) => ({
      ...s,
      requirements: s.requirements.map((r) =>
        r.id === id ? { ...r, status: "rejected", adminNote: note } : r,
      ),
    }));
  };

  const createTeacherProposalMock: Store["createTeacherProposalMock"] = async (p) => {
    const created: Proposal = {
      ...p,
      id: rid("prop-"),
      createdAt: now(),
      status: "pending",
    };
    setState((s) => ({ ...s, proposals: [created, ...s.proposals] }));
    return created;
  };

  const createPaymentMock: Store["createPaymentMock"] = async (proposalId) => {
    const proposal = state.proposals.find((p) => p.id === proposalId);
    if (!proposal) throw new Error("Proposal not found");
    const amount = proposal.rate * proposal.sessions;
    const created: PaymentRecord = {
      id: rid("pay-"),
      proposalId,
      requirementId: proposal.requirementId,
      amount,
      status: "paid",
      method: "card",
      createdAt: now(),
    };
    setState((s) => ({
      ...s,
      payments: [created, ...s.payments],
      proposals: s.proposals.map((pp) =>
        pp.id === proposalId ? { ...pp, status: "selected" } : pp,
      ),
    }));
    return created;
  };

  const unlockTeacherContactMock: Store["unlockTeacherContactMock"] = async (
    requirementId,
    teacherId,
  ) => {
    setState((s) => ({
      ...s,
      unlockedContacts: { ...s.unlockedContacts, [`${requirementId}:${teacherId}`]: true },
      requirements: s.requirements.map((r) =>
        r.id === requirementId ? { ...r, status: "fulfilled" } : r,
      ),
    }));
  };

  const isContactUnlocked: Store["isContactUnlocked"] = (requirementId, teacherId) =>
    !!state.unlockedContacts[`${requirementId}:${teacherId}`];

  const reset = () => setState(SEED);

  return (
    <Ctx.Provider
      value={{
        ...state,
        createRequirementPostMock,
        approveRequirementMock,
        rejectRequirementMock,
        createTeacherProposalMock,
        createPaymentMock,
        unlockTeacherContactMock,
        isContactUnlocked,
        reset,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useRequirementsStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useRequirementsStore must be used inside RequirementsStoreProvider");
  return v;
}
