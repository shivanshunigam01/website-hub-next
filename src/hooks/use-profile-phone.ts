"use client";

import { useEffect, useState } from "react";
import type { AuthUser } from "@/lib/auth-types";
import { useDetectedPhoneCountryCode } from "@/hooks/use-detected-phone-country-code";
import { DEFAULT_PHONE_COUNTRY_CODE } from "@/lib/phone-from-country";
import { formatStoredPhone } from "@/lib/phone-codes";
import {
  isWhatsappPhoneLocked,
  readWhatsappVerifiedPhone,
  resolveProfilePhoneFields,
  whatsappSubmitPhone,
} from "@/lib/whatsapp-verified-phone";

export function useProfilePhone(user: AuthUser | null | undefined) {
  const resolved = resolveProfilePhoneFields(user);
  const hasSavedPhone = Boolean(user?.phone?.trim() || user?.phoneCountryCode || resolved?.number);
  const locked = isWhatsappPhoneLocked(user);
  const isWhatsappVerified = Boolean(readWhatsappVerifiedPhone());
  const { phoneCountryCode: detectedDial } = useDetectedPhoneCountryCode(
    !hasSavedPhone && !isWhatsappVerified,
  );

  const [phoneCountryCode, setPhoneCountryCode] = useState(
    resolved?.countryCode ?? DEFAULT_PHONE_COUNTRY_CODE,
  );
  const [phoneNumber, setPhoneNumber] = useState(resolved?.number ?? "");

  useEffect(() => {
    const next = resolveProfilePhoneFields(user);
    if (!next?.number && !next?.countryCode) return;
    setPhoneCountryCode(next.countryCode);
    setPhoneNumber(next.number);
  }, [user?.id, user?.phone, user?.phoneCountryCode, user?.provider]);

  useEffect(() => {
    if (hasSavedPhone || isWhatsappVerified || !detectedDial) return;
    setPhoneCountryCode(detectedDial);
  }, [hasSavedPhone, isWhatsappVerified, detectedDial]);

  const getSubmitPhone = () => whatsappSubmitPhone(user, phoneCountryCode, phoneNumber);

  const formattedPhone = () => {
    const submit = getSubmitPhone();
    return submit.phone || formatStoredPhone(phoneCountryCode, phoneNumber);
  };

  return {
    phoneCountryCode,
    setPhoneCountryCode,
    phoneNumber,
    setPhoneNumber,
    locked,
    isWhatsappVerified,
    userHasSavedPhone: hasSavedPhone,
    getSubmitPhone,
    formattedPhone,
  };
}
