import { Suspense } from "react";
import TeacherOnboardingProfilePage from "@/views/teacher.onboarding.profile";
import { createStaticPageMetadata } from "@/lib/page-metadata";

export const generateMetadata = createStaticPageMetadata("/teacher/onboarding/profile");


export default function Page() {
  return (
    <Suspense fallback={null}>
      <TeacherOnboardingProfilePage />
    </Suspense>
  );
}
