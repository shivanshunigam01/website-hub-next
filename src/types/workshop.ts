export type WorkshopStatus = "pending" | "approved" | "rejected" | "inactive";
export type WorkshopMode = "online" | "offline" | "other";

export type Workshop = {
  id: string;
  title: string;
  category: string;
  description: string;
  teacherId?: string;
  teacherName: string;
  workshopDate: string;
  startTime: string;
  endTime: string;
  mode: WorkshopMode;
  modeOther?: string;
  meetingLink: string;
  location: string;
  isFree: boolean;
  price: number;
  currency?: string;
  maxStudents: number;
  enrolledStudents: number;
  spotsLeft: number;
  imageUrl: string;
  approvedImageUrl?: string;
  status: WorkshopStatus;
  adminRemark: string;
  isUpcoming?: boolean;
  registered?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type WorkshopRegistration = {
  id: string;
  studentName: string;
  studentEmail: string;
  registeredAt: string;
};

export type WorkshopDetail = Workshop & {
  registrations?: WorkshopRegistration[];
};

export type WorkshopListResponse = {
  items: Workshop[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type WorkshopRequestPayload = {
  title: string;
  category: string;
  description: string;
  workshopDate: string;
  startTime: string;
  endTime: string;
  mode: WorkshopMode;
  modeOther?: string;
  meetingLink?: string;
  location?: string;
  isFree: boolean;
  price?: number;
  maxStudents: number;
  imageUrl?: string;
};
