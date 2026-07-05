export type JobApplicationStatus = "pending" | "approved" | "rejected";

export type JobApplication = {
  id: string;
  requirementId: string;
  requirementTitle: string;
  teacherId: string;
  teacherName: string;
  teacherEmail?: string;
  message: string;
  proposedRate: number;
  sessions: number;
  currency: string;
  status: JobApplicationStatus;
  adminRemark?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt?: string;
};

export type CreateJobApplicationPayload = {
  requirementId: string;
  message: string;
  proposedRate?: number;
  sessions?: number;
};

export type AdminApproveApplicationResult = JobApplication & { emailSent?: boolean };
