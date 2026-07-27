import { Suspense } from "react";
import { RoleLoginForm } from "@/views/login";
import { createStaticPageMetadata } from "@/lib/page-metadata";

export const generateMetadata = createStaticPageMetadata("/login/student");

export default function Page() {
  return (
    <Suspense fallback={null}>
      <RoleLoginForm portal="student" />
    </Suspense>
  );
}
