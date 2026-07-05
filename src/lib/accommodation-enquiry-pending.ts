export const ACCOMMODATION_ENQUIRY_PENDING_KEY = "tp.accommodation.enquiry.pending";

export type PendingAccommodationEnquiry = {
  accommodationId: string;
  draftMessage?: string;
  returnPath: string;
};

export function savePendingEnquiry(pending: PendingAccommodationEnquiry) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(ACCOMMODATION_ENQUIRY_PENDING_KEY, JSON.stringify(pending));
}

export function readPendingEnquiry(): PendingAccommodationEnquiry | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(ACCOMMODATION_ENQUIRY_PENDING_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PendingAccommodationEnquiry;
  } catch {
    return null;
  }
}

export function clearPendingEnquiry() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(ACCOMMODATION_ENQUIRY_PENDING_KEY);
}

export function buildEnquiryReturnPath(accommodationId: string) {
  const params = new URLSearchParams({ enquiry: accommodationId });
  return `/accommodation?${params.toString()}`;
}

export function loginRedirectForEnquiry(accommodationId: string) {
  const returnPath = buildEnquiryReturnPath(accommodationId);
  return `/login?redirect=${encodeURIComponent(returnPath)}`;
}
