import type { ReactNode } from "react";
import { LmsRouteProviders } from "@/components/providers/RouteStoreProviders";

export default function LmsLayout({ children }: { children: ReactNode }) {
  return <LmsRouteProviders>{children}</LmsRouteProviders>;
}
