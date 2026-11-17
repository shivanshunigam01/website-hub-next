// Central contact info for TeacherPoint
export const WHATSAPP_NUMBER_DISPLAY = "+1 (581) 441-0496";
export const WHATSAPP_NUMBER_E164 = "+15814410496";
export const WHATSAPP_DIGITS = "15814410496";
export const WHATSAPP_DEFAULT_MESSAGE = "Hi, I need Assistant Help";
export const WHATSAPP_LINK = `https://api.whatsapp.com/send?phone=${WHATSAPP_DIGITS}`;

export const whatsappLinkWithMessage = (message: string = WHATSAPP_DEFAULT_MESSAGE) =>
  `${WHATSAPP_LINK}&text=${encodeURIComponent(message)}`;