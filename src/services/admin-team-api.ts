import { api } from "@/lib/api";

export type AdminTeamMember = {
  id: string;
  userId: string;
  staffRole: "super_admin" | "manager" | "moderator";
  isActive: boolean;
  name: string;
  email: string;
  registrationIp?: string;
  lastLoginIp?: string;
  lastLoginAt?: string | null;
  ipRiskFlag?: boolean;
  createdAt?: string;
};

export async function getAdminTeam() {
  return api<AdminTeamMember[]>("/admin/team");
}
