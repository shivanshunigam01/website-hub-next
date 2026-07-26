"use client";

import { Navigate } from "@/lib/navigation";

/** Legacy path — online admin-verified tutor jobs. */
export default function OnlineTeachingRedirect() {
  return <Navigate to="/tutor-jobs?mode=online" />;
}
