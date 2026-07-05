import { api } from "@/lib/api";

/** Disable or re-enable account — blocked at login, token refresh, and API when inactive. */
export async function setAdminUserActive(userId: string, isActive: boolean) {
  return api<{ id: string; isActive: boolean }>(`/admin/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
}
