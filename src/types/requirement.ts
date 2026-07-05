export type RequirementStatus = "pending" | "approved" | "rejected" | "fulfilled";

export type RequirementJobType = "tutoring" | "assignment";

export type RequirementMode = "online" | "offline" | "both";

export type Requirement = {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  title: string;
  subject: string;
  skills: string[];
  level: string;
  levelCode?: string;
  jobType: RequirementJobType;
  mode: RequirementMode;
  sessionsPerWeek?: number;
  location: string;
  city: string;
  country: string;
  budget: number;
  budgetPerHour: number;
  currency: string;
  duration?: string;
  details: string;
  status: RequirementStatus;
  backendStatus?: string;
  approved: boolean;
  adminNote?: string;
  adminRemark?: string;
  createdAt: string;
  updatedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
};

export type RequirementListResponse = {
  items: Requirement[];
  pagination?: { total: number; page: number; limit: number };
};

export type RequirementFacets = {
  subjects: string[];
  skills: string[];
  locations: string[];
  totalJobs: number;
};

export type CreateRequirementPayload = {
  title: string;
  subject: string;
  skills?: string[];
  level?: string;
  levelOther?: string;
  jobType?: RequirementJobType;
  mode?: RequirementMode;
  sessionsPerWeek?: number;
  location?: string;
  city?: string;
  country?: string;
  budgetPerHour?: number;
  budget?: number;
  currency?: string;
  duration?: string;
  durationOther?: string;
  details: string;
};

export type TutorJobsFilters = {
  q?: string;
  subject?: string;
  skill?: string;
  location?: string;
  mode?: "all" | "online" | "home";
  jobType?: "all" | "tutoring" | "assignment";
};

export type AdminApproveResult = Requirement & { emailSent?: boolean };
