"use client";

import { Navigate } from "@/lib/navigation";

/** Legacy path — assignment-help jobs verified by admin. */
export default function AssignmentJobsRedirect() {
  return <Navigate to="/tutor-jobs?jobType=assignment" />;
}
