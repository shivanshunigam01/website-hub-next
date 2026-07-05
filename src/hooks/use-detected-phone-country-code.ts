import { useLocationContext } from "@/hooks/use-user-location";
import { DEFAULT_PHONE_COUNTRY_CODE } from "@/lib/phone-from-country";

/**
 * Default phone dial code from browser IP country (+91 India, +971 UAE, +1 US, …).
 */
export function useDetectedPhoneCountryCode(enabled = true) {
  const { phoneDialCode, status: locationStatus } = useLocationContext();

  return {
    phoneCountryCode: enabled ? phoneDialCode ?? DEFAULT_PHONE_COUNTRY_CODE : DEFAULT_PHONE_COUNTRY_CODE,
    isLoading: enabled && locationStatus === "loading",
  };
}
