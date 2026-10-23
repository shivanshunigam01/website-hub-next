import type { ReactNode } from "react";
import { CourseDetailRouteProviders } from "@/components/providers/RouteStoreProviders";

export default function CourseDetailLayout({ children }: { children: ReactNode }) {
  return <CourseDetailRouteProviders>{children}</CourseDetailRouteProviders>;
}
