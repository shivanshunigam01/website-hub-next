import type { ConnectionStatus } from "@/services/connections-api";

/** Human-readable labels for connection request status in dashboards/UI. */
export function connectionStatusLabel(status: ConnectionStatus | string | undefined): string {
  switch (status) {
    case "connected":
      return "Paid";
    case "approved":
      return "Awaiting payment";
    case "pending":
      return "Pending";
    case "rejected":
      return "Rejected";
    default:
      return status || "—";
  }
}

export function paymentStatusLabel(status: string | undefined): string {
  if (!status) return "—";
  if (status === "paid") return "Paid";
  if (status === "pending") return "Pending";
  if (status === "failed") return "Failed";
  if (status === "refunded") return "Refunded";
  return status.charAt(0).toUpperCase() + status.slice(1);
}
