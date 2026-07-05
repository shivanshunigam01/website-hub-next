import { apiPublic } from "@/lib/api";
import type { AuthSession } from "@/lib/auth-types";
import type {
  SendWhatsappOtpResponse,
  VerifyWhatsappOtpResponse,
  WhatsappOtpPurpose,
  WhatsappSignupPayload,
} from "@/types/whatsapp-auth";

export function formatPhoneForApi(countryCode: string, localNumber: string): string {
  const cc = countryCode.replace(/\D/g, "");
  const local = localNumber.replace(/\D/g, "");
  if (!cc || !local) return "";
  return `${cc}${local}`;
}

export async function sendWhatsappOtp(phone: string, purpose: WhatsappOtpPurpose) {
  return apiPublic<SendWhatsappOtpResponse>("/auth/whatsapp/send-otp", {
    method: "POST",
    body: JSON.stringify({ phone, purpose }),
  });
}

export async function verifyWhatsappOtp(phone: string, otp: string, purpose: WhatsappOtpPurpose) {
  return apiPublic<VerifyWhatsappOtpResponse>("/auth/whatsapp/verify-otp", {
    method: "POST",
    body: JSON.stringify({ phone, otp, purpose }),
  });
}

export async function loginWithWhatsapp(phone: string) {
  return apiPublic<
    | (AuthSession & { newUser?: false })
    | { newUser: true; phone: string }
  >("/auth/whatsapp/login", {
    method: "POST",
    body: JSON.stringify({ phone }),
  });
}

export async function signupWithWhatsapp(payload: WhatsappSignupPayload) {
  return apiPublic<AuthSession>("/auth/whatsapp/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
