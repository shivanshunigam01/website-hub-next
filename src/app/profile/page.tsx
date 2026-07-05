import { Suspense } from "react";
import ProfileSetupPage from "@/views/profile";
import { createStaticPageMetadata } from "@/lib/page-metadata";

export const generateMetadata = createStaticPageMetadata("/profile");


export default function Page() {
  return (
    <Suspense fallback={null}>
      <ProfileSetupPage />
    </Suspense>
  );
}
