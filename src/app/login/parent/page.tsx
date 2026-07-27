import { Suspense } from "react";
import { RoleLoginForm } from "@/views/login";
import { createStaticPageMetadata } from "@/lib/page-metadata";

export const generateMetadata = createStaticPageMetadata("/login/parent");

export default function Page() {
  return (
    <Suspense fallback={null}>
      <RoleLoginForm portal="parent" />
    </Suspense>
  );
}
