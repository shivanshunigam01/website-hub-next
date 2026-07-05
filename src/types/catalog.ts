export type CourseLevel = string;

export interface Course {
  id: string;
  title: string;
  instructor: string;
  instructorId?: string;
  category: string;
  categoryId?: string;
  level: CourseLevel;
  rating: number;
  reviews: number;
  price: number;
  oldPrice: number;
  currency?: string;
  duration: string;
  lessons: number;
  students: number;
  bestseller?: boolean;
  certificate: boolean;
  language: string;
  gradient: string;
  description: string;
  status?: string;
  imageUrl?: string;
}

export interface TutorTeachingSubject {
  name: string;
  fromLevel: string;
  toLevel: string;
}

export interface TutorEducationEntry {
  id?: string;
  degree: string;
  institute: string;
  startDate?: string | null;
  endDate?: string | null;
  description?: string;
}

export interface TutorExperienceEntry {
  id?: string;
  title: string;
  organization: string;
  startDate?: string | null;
  endDate?: string | null;
  description?: string;
}

export interface Tutor {
  id: string;
  name: string;
  avatarUrl?: string;
  image?: string;
  profilePhoto?: string;
  subject: string;
  subjects?: string[];
  teachingSubjects?: TutorTeachingSubject[];
  speciality?: string;
  teacherType?: "individual" | "company" | "coaching_institute" | "school" | "college" | "freelancer";
  location: string;
  country?: string;
  state?: string;
  city?: string;
  locality?: string;
  publicLocation?: string;
  rating: number;
  reviews: number;
  experience: number;
  yearsOfExperience?: number;
  price: number;
  currency?: string;
  verified: boolean;
  topTen?: boolean;
  online: boolean;
  onlineTeaching?: boolean;
  homeTuition?: boolean;
  groupClasses?: boolean;
  assignmentHelp?: boolean;
  language: string[];
  gender: "male" | "female" | "other";
  bio: string;
  teachingStyle?: string;
  initials: string;
  gradient: string;
  availability: string;
  lastLoginAt?: string | null;
  education?: TutorEducationEntry[];
  experienceEntries?: TutorExperienceEntry[];
  profileCompleted?: boolean;
}

export interface CategoryItem {
  id: string;
  name: string;
  icon?: string;
  slug?: string;
  subcategories: { id: string; name: string }[];
}
