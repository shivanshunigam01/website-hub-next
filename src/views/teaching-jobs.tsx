"use client";

import { Navigate } from "@/lib/navigation";

/** Legacy path — show admin-verified tutor jobs. */
export default function TeachingJobsRedirect() {
  return <Navigate to="/tutor-jobs" />;
}
