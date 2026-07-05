import { api } from "@/lib/api";

export type IpRiskLevel = "low" | "medium" | "high";

export type IpMonitorUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  registrationIp?: string;
  lastLoginIp?: string;
  lastLoginAt?: string;
  ipRiskFlag: boolean;
  ipAdminNote?: string;
  createdAt?: string;
  isActive?: boolean;
};

export type IpMonitorGroup = {
  ipAddress: string;
  totalUsers: number;
  riskLevel: IpRiskLevel;
  firstSeenAt: string;
  lastSeenAt: string;
  roleCounts: { student: number; teacher: number; parent: number; admin: number };
  users: IpMonitorUser[];
};

export type IpMonitorSummary = {
  totalFlaggedIps: number;
  totalAffectedUsers: number;
  highRiskIps: number;
  todayDuplicateLoginIps: number;
};

export type IpLogEntry = {
  id: string;
  userId: string;
  email: string;
  role: string;
  ipAddress: string;
  action: "register" | "login";
  userAgent?: string;
  deviceInfo?: string;
  createdAt: string;
};

export type IpDetail = {
  ipAddress: string;
  totalUsers: number;
  riskLevel: IpRiskLevel;
  roleCounts: IpMonitorGroup["roleCounts"];
  users: IpMonitorUser[];
  logs: IpLogEntry[];
};

export async function getIpMonitorSummary() {
  return api<IpMonitorSummary>("/admin/ip-monitor/summary");
}

export async function getIpMonitorGroups() {
  return api<IpMonitorGroup[]>("/admin/ip-monitor/groups");
}

export async function getIpMonitorUsersByIp(ipAddress: string) {
  return api<IpDetail>(`/admin/ip-monitor/users/${encodeURIComponent(ipAddress)}`);
}

export async function getIpMonitorLogs(params: {
  ipAddress?: string;
  userId?: string;
  action?: string;
  role?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") q.set(k, String(v));
  });
  return api<{ items: IpLogEntry[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(
    `/admin/ip-monitor/logs?${q}`,
  );
}

export async function updateUserIpRiskFlag(
  userId: string,
  payload: { ipRiskFlag: boolean; ipAdminNote?: string },
) {
  return api<IpMonitorUser>(`/admin/ip-monitor/users/${userId}/flag`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
