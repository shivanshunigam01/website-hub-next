import { Suspense } from "react";
import RoleSelectPage from "@/views/role-select";
import { createStaticPageMetadata } from "@/lib/page-metadata";

export const generateMetadata = createStaticPageMetadata("/role-select");


export default function Page() {
  return (
    <Suspense fallback={null}>
      <RoleSelectPage />
    </Suspense>
  );
}
