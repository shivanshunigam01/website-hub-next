"use client";

import type { ReactNode } from "react";
import { AdminStoreProvider } from "@/hooks/use-admin-store";
import { LmsStoreProvider } from "@/hooks/use-lms-store";
import { LearningProvider } from "@/hooks/use-learning";
import { PlatformStoreProvider } from "@/hooks/use-platform-store";
import { MarketplaceProvider } from "@/hooks/use-marketplace";

/** Admin console: mock CMS store + platform team + marketplace moderation. */
export function AdminRouteProviders({ children }: { children: ReactNode }) {
  return (
    <AdminStoreProvider>
      <PlatformStoreProvider>
        <MarketplaceProvider>{children}</MarketplaceProvider>
      </PlatformStoreProvider>
    </AdminStoreProvider>
  );
}

export function LmsRouteProviders({ children }: { children: ReactNode }) {
  return (
    <LmsStoreProvider>
      <LearningProvider>{children}</LearningProvider>
    </LmsStoreProvider>
  );
}

export function StudentRouteProviders({ children }: { children: ReactNode }) {
  return <LearningProvider>{children}</LearningProvider>;
}

export function MarketplaceRouteProviders({ children }: { children: ReactNode }) {
  return <MarketplaceProvider>{children}</MarketplaceProvider>;
}

/** Accommodation inquiries + local listing fallback share the admin mock store. */
export function AccommodationRouteProviders({ children }: { children: ReactNode }) {
  return <AdminStoreProvider>{children}</AdminStoreProvider>;
}

/** Course detail: enrollment/reviews + LMS lesson UI. */
export function CourseDetailRouteProviders({ children }: { children: ReactNode }) {
  return (
    <LmsStoreProvider>
      <LearningProvider>{children}</LearningProvider>
    </LmsStoreProvider>
  );
}
