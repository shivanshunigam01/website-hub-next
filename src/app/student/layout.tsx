import type { ReactNode } from "react";
import { StudentRouteProviders } from "@/components/providers/RouteStoreProviders";

export default function StudentLayout({ children }: { children: ReactNode }) {
  return <StudentRouteProviders>{children}</StudentRouteProviders>;
}
