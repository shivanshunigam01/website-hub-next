// Central contact info for TeacherPoint
export const WHATSAPP_NUMBER_DISPLAY = "+1 (267) 314-6222";
export const WHATSAPP_NUMBER_E164 = "+12673146222";
export const WHATSAPP_DIGITS = "12673146222";
export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_DIGITS}`;

export const whatsappLinkWithMessage = (message?: string) =>
  message ? `${WHATSAPP_LINK}?text=${encodeURIComponent(message)}` : WHATSAPP_LINK;
