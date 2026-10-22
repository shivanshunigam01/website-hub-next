import type { ReactNode } from "react";
import { MarketplaceRouteProviders } from "@/components/providers/RouteStoreProviders";

export default function MarketplaceLayout({ children }: { children: ReactNode }) {
  return <MarketplaceRouteProviders>{children}</MarketplaceRouteProviders>;
}
