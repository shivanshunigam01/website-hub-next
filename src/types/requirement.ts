export type RequirementPosterRole = "student" | "parent";

export type RequirementStatus = "pending" | "approved" | "rejected" | "fulfilled";

export type RequirementJobType = "tutoring" | "assignment";

export type RequirementMode = "online" | "offline" | "both";

export type Requirement = {
  id: string;
  studentId: string;
  studentName: string;
  /** Display name of the poster (alias of studentName). */
  posterName?: string;
  /** Who posted: student or parent. */
  posterRole?: RequirementPosterRole;
  /** Email/phone verified poster when available. */
  posterVerified?: boolean;
  /** True when the poster verified a phone number. */
  posterPhoneVerified?: boolean;
  /** Masked public phone, e.g. "+91-**********". Never the real number. */
  posterPhoneMasked?: string;
  /** Only present for owner/admin responses — never on public jobs. */
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
  addressFormatted?: string;
  city: string;
  country: string;
  budget: number;
  budgetPerHour: number;
  budgetUnit?: string;
  currency: string;
  duration?: string;
  timeCommitment?: string;
  teacherGender?: string;
  languages?: string[];
  tutorOrigin?: string;
  meetingOptions?: {
    online?: boolean;
    atMyPlace?: boolean;
    travelToTutor?: boolean;
  };
  attachments?: { url: string; name: string; mimeType?: string; size?: number }[];
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
  levels?: string[];
  totalJobs: number;
};

export type CreateRequirementPayload = {
  title: string;
  subject: string;
  subjectPendingApproval?: boolean;
  skills?: string[];
  level?: string;
  levelOther?: string;
  jobType?: RequirementJobType;
  mode?: RequirementMode;
  meetingOptions?: {
    online?: boolean;
    atMyPlace?: boolean;
    travelToTutor?: boolean;
  };
  sessionsPerWeek?: number;
  location?: string;
  city?: string;
  country?: string;
  addressFormatted?: string;
  placeId?: string;
  locationLat?: number;
  locationLng?: number;
  budgetPerHour?: number;
  budget?: number;
  currency?: string;
  budgetUnit?: "hour" | "day" | "week" | "month" | "year" | "fixed";
  duration?: string;
  durationOther?: string;
  timeCommitment?: "part-time" | "full-time" | "one-time" | "flexible";
  teacherGender?: "any" | "prefer-female" | "prefer-male" | "only-female" | "only-male";
  languages?: string[];
  tutorOrigin?: string;
  phoneCountryCode: string;
  phone: string;
  attachments?: { url: string; name: string; mimeType?: string; size?: number }[];
  details: string;
  acceptedTerms: true;
};

export type TutorJobsFilters = {
  q?: string;
  subject?: string;
  skill?: string;
  location?: string;
  mode?: "all" | "online" | "home";
  jobType?: "all" | "tutoring" | "assignment";
  level?: "all" | "elem" | "middle" | "high" | "college" | "pro" | "other";
};

export type AdminApproveResult = Requirement & { emailSent?: boolean };
