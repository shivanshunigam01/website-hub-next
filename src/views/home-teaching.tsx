"use client";

import { Navigate } from "@/lib/navigation";

/** Legacy path — home / in-person admin-verified tutor jobs. */
export default function HomeTeachingRedirect() {
  return <Navigate to="/tutor-jobs?mode=home" />;
}
