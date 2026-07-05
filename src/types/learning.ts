export type Certificate = {
  id: string;
  enrollmentId?: string;
  courseId?: string;
  courseTitle: string;
  studentName: string;
  instructor: string;
  issuedAt: string;
  serial: string;
};

export type CourseReview = {
  id: string;
  studentName: string;
  rating: number;
  comment: string;
  createdAt: string;
};
