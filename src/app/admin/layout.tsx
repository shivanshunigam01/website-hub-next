import type { ReactNode } from "react";
import { AdminRouteProviders } from "@/components/providers/RouteStoreProviders";
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminRouteProviders>{children}</AdminRouteProviders>;
}
