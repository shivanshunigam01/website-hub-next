import { api } from "@/lib/api";
import type { AuthUser, ProfileCompletionProgress, ProfileUpdateResult } from "@/lib/auth-types";

export type TeacherProfilePayload = {
  name?: string;
  phone?: string;
  phoneCountryCode?: string;
  avatarUrl?: string;
  teacherProfile: Record<string, unknown>;
};

export type TeacherProfileResponse = ProfileUpdateResult & {
  progress?: ProfileCompletionProgress;
};

export async function fetchTeacherProfile() {
  const data = await api<{ user: AuthUser; progress: ProfileCompletionProgress }>("/teacher/profile");
  return data;
}

export async function saveTeacherProfile(payload: TeacherProfilePayload, method: "POST" | "PUT" = "PUT") {
  return api<TeacherProfileResponse>("/teacher/profile", {
    method,
    body: JSON.stringify(payload),
  });
}
