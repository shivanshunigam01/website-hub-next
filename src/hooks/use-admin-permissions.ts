import { useCallback } from "react";
import { useApp } from "@/hooks/use-app";
import { ROLE_PERMISSIONS, type AdminRole } from "@/hooks/use-platform-store";

export const ADMIN_TAB_PERMISSIONS: Record<string, string | null> = {
  overview: null,
  users: "users.manage",
  "ip-monitor": "users.manage",
  team: "team.manage",
  approvals: "courses.approve",
  workshops: "courses.approve",
  requirements: "courses.approve",
  "job-applications": "courses.approve",
  connections: "courses.approve",
  marketplace: "courses.approve",
  tickets: "tickets.manage",
  notifications: "notifications.send",
  mail: "settings.manage",
  reports: "reports.view",
  earnings: "earnings.view",
  revenuepro: "earnings.view",
  courses: "courses.manage",
  subjects: "courses.manage",
  teachers: "users.manage",
  packages: "courses.manage",
  accommodations: "courses.manage",
  inquiries: "tickets.manage",
  ads: "ads.manage",
  revenue: "earnings.view",
  seo: "settings.manage",
  pwa: "settings.manage",
  settings: "settings.manage",
};

export function useAdminPermission() {
  const { user } = useApp();

  const hasPermission = useCallback(
    (perm: string) => {
      if (!user || user.role !== "admin") return false;
      const role = user.staffRole as AdminRole | undefined;
      if (!role) return true;
      if (role === "super_admin") return true;
      return ROLE_PERMISSIONS[role]?.includes(perm) ?? false;
    },
    [user],
  );

  const canAccessTab = useCallback(
    (tabId: string) => {
      const perm = ADMIN_TAB_PERMISSIONS[tabId];
      if (!perm) return true;
      return hasPermission(perm);
    },
    [hasPermission],
  );

  return { hasPermission, canAccessTab, staffRole: user?.staffRole as AdminRole | undefined };
}

export const STAFF_ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: "Super Admin",
  manager: "Manager",
  moderator: "Moderator",
};
