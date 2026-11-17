import { apiPublic } from "@/lib/api";
import type { AuthSession } from "@/lib/auth-types";

export type EmailOtpPurpose = "login" | "signup";

export async function sendEmailAuthOtp(body: {
  email: string;
  purpose: EmailOtpPurpose;
  name?: string;
  role?: "student" | "teacher" | "parent";
}) {
  return apiPublic<{
    sent?: boolean;
    email?: string;
    expiresInSeconds?: number;
    devOtp?: string;
  }>("/auth/email-otp/send", {
    method: "POST",
    body: JSON.stringify({
      email: body.email.trim().toLowerCase(),
      purpose: body.purpose,
      ...(body.name ? { name: body.name.trim() } : {}),
      ...(body.role ? { role: body.role } : {}),
    }),
  });
}

export async function verifyEmailAuthOtp(body: {
  email: string;
  otp: string;
  purpose: EmailOtpPurpose;
  name?: string;
  role?: "student" | "teacher" | "parent";
  expectedRole?: "student" | "teacher" | "parent";
}) {
  return apiPublic<AuthSession>("/auth/email-otp/verify", {
    method: "POST",
    body: JSON.stringify({
      email: body.email.trim().toLowerCase(),
      otp: body.otp.trim(),
      purpose: body.purpose,
      ...(body.name ? { name: body.name.trim() } : {}),
      ...(body.role ? { role: body.role } : {}),
      ...(body.expectedRole ? { expectedRole: body.expectedRole } : {}),
    }),
  });
}
