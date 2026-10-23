import type { ReactNode } from "react";
import { AccommodationRouteProviders } from "@/components/providers/RouteStoreProviders";

export default function AccommodationLayout({ children }: { children: ReactNode }) {
  return <AccommodationRouteProviders>{children}</AccommodationRouteProviders>;
}
