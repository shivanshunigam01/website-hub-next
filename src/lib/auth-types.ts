export type AuthRole = "student" | "teacher" | "parent" | "admin";

export type StaffRole = "super_admin" | "manager" | "moderator";

export type TeacherType =
  | "individual"
  | "coaching_institute"
  | "school"
  | "college"
  | "freelancer"
  | "company"
  | "other";

export interface TeachingSubject {
  name: string;
  fromLevel: string;
  toLevel: string;
}

export interface EducationEntry {
  id?: string;
  degree: string;
  institute: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface ExperienceEntry {
  id?: string;
  title: string;
  organization: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface TeacherProfile {
  profilePhoto?: string;
  teacherType?: TeacherType;
  teacherTypeOther?: string;
  speciality?: string;
  birthDate?: string;
  subjects?: string[];
  teachingSubjects?: TeachingSubject[];
  bio?: string;
  experience?: number;
  yearsOfExperience?: number;
  hourlyRate?: number;
  currency?: string;
  location?: string;
  country?: string;
  state?: string;
  city?: string;
  locality?: string;
  publicLocation?: string;
  languages?: string[];
  gender?: "male" | "female" | "other";
  genderOther?: string;
  availability?: string;
  onlineTeaching?: boolean;
  homeTuition?: boolean;
  groupClasses?: boolean;
  assignmentHelp?: boolean;
  teachingStyle?: string;
  profileCompleted?: boolean;
  education?: EducationEntry[];
  experiences?: ExperienceEntry[];
  experienceEntries?: ExperienceEntry[];
  initials?: string;
  gradient?: string;
  rating?: number;
  reviewCount?: number;
  verified?: boolean;
  online?: boolean;
}

export interface ProfileCompletionChecks {
  profilePhoto: boolean;
  bio: boolean;
  subjects: boolean;
  experience: boolean;
  education: boolean;
  location: boolean;
  hourlyRate: boolean;
}

export interface ProfileCompletionProgress {
  checks: ProfileCompletionChecks;
  completed: number;
  total: number;
  percent: number;
}

export interface StudentProfile {
  grade?: string;
  goals?: string;
}

export interface ParentChild {
  name: string;
  age?: number;
  grade?: string;
}

export interface ParentProfile {
  children?: ParentChild[];
}

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  role: AuthRole;
  staffRole?: StaffRole;
  adminPermissions?: string[];
  avatarUrl?: string | null;
  phone?: string;
  phoneCountryCode?: string;
  provider?: "local" | "google" | "whatsapp";
  hasPassword?: boolean;
  theme?: "light" | "dark";
  locale?: string;
  profileComplete?: boolean;
  isActive?: boolean;
  isVerified?: boolean;
  registrationIp?: string;
  lastLoginIp?: string;
  lastLoginAt?: string;
  ipRiskFlag?: boolean;
  ipAdminNote?: string;
  teacherProfile?: TeacherProfile;
  studentProfile?: StudentProfile;
  parentProfile?: ParentProfile;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  profileComplete: boolean;
  requiresEmailVerification?: boolean;
  verificationEmailSent?: boolean;
  verificationEmailError?: string;
  devOtp?: string;
  welcomeEmailSent?: boolean;
  welcomeEmailError?: string;
}

export type ProfileUpdateResult = AuthUser & {
  welcomeEmailSent?: boolean;
  progress?: ProfileCompletionProgress;
};
