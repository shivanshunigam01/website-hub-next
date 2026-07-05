import type { AuthUser } from "@/lib/auth-types";
import { parseE164Digits, parseStoredPhone } from "@/lib/phone-codes";

const STORAGE_KEY = "tp_whatsapp_verified_phone";

export type WhatsappVerifiedPhone = {
  e164: string;
  countryCode: string;
  number: string;
  verifiedAt: number;
};

export function persistWhatsappVerifiedPhone(phoneE164: string) {
  if (typeof window === "undefined" || !phoneE164?.trim()) return;
  const parsed = parseE164Digits(phoneE164);
  const payload: WhatsappVerifiedPhone = {
    e164: parsed.e164,
    countryCode: parsed.countryCode,
    number: parsed.number,
    verifiedAt: Date.now(),
  };
  const raw = JSON.stringify(payload);
  sessionStorage.setItem(STORAGE_KEY, raw);
  localStorage.setItem(STORAGE_KEY, raw);
}

export function readWhatsappVerifiedPhone(): WhatsappVerifiedPhone | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as WhatsappVerifiedPhone;
    if (!data?.e164 || !data?.countryCode || !data?.number) return null;
    return data;
  } catch {
    return null;
  }
}

export function clearWhatsappVerifiedPhone() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_KEY);
}

/** Merge verified WhatsApp digits into the auth user when the API omitted them. */
export function enrichUserWithWhatsappPhone(user: AuthUser): AuthUser {
  const wa = readWhatsappVerifiedPhone();
  if (!wa) return user;
  return {
    ...user,
    provider: user.provider ?? "whatsapp",
    phone: user.phone?.trim() ? user.phone : wa.number,
    phoneCountryCode: user.phoneCountryCode || wa.countryCode,
  };
}

export function isWhatsappAuthUser(user: AuthUser | null | undefined): boolean {
  if (!user) return false;
  if (user.provider === "whatsapp") return true;
  return Boolean(readWhatsappVerifiedPhone());
}

/** Lock phone edits when the account was verified via WhatsApp OTP. */
export function isWhatsappPhoneLocked(user: AuthUser | null | undefined): boolean {
  return isWhatsappAuthUser(user) && Boolean(readWhatsappVerifiedPhone());
}

export function resolveProfilePhoneFields(user: AuthUser | null | undefined) {
  const enriched = user ? enrichUserWithWhatsappPhone(user) : null;
  if (enriched?.phone?.trim() || enriched?.phoneCountryCode) {
    return parseStoredPhone(enriched.phone, enriched.phoneCountryCode);
  }
  const wa = readWhatsappVerifiedPhone();
  if (wa) {
    return { countryCode: wa.countryCode, number: wa.number };
  }
  return null;
}

export function whatsappSubmitPhone(
  user: AuthUser | null | undefined,
  phoneCountryCode: string,
  phoneNumber: string,
) {
  if (isWhatsappPhoneLocked(user)) {
    const wa = readWhatsappVerifiedPhone();
    if (wa) {
      return {
        phone: `${wa.countryCode}${wa.number}`,
        phoneCountryCode: wa.countryCode,
      };
    }
  }
  const digits = phoneNumber.replace(/\D/g, "");
  return {
    phone: digits ? `${phoneCountryCode}${digits}` : "",
    phoneCountryCode,
  };
}
