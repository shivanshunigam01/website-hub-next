export type WhatsappOtpPurpose = "login" | "signup" | "verify";

export type SendWhatsappOtpResponse = {
  sent: boolean;
  phone: string;
  expiresInSeconds?: number;
  devOtp?: string;
};

export type VerifyWhatsappOtpResponse = {
  verified: boolean;
  phone: string;
  alreadyVerified?: boolean;
};

export type WhatsappLoginResponse =
  | { newUser: true; phone: string }
  | import("@/lib/auth-types").AuthSession;

export type WhatsappSignupPayload = {
  name: string;
  phone: string;
  role: "student" | "teacher" | "parent";
};
