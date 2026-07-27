import { Suspense } from "react";
import type { Metadata } from "next";
import { RoleLoginForm } from "@/views/login";

export const metadata: Metadata = {
  title: "Staff console · TeacherPoint",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <RoleLoginForm portal="admin" />
    </Suspense>
  );
}
