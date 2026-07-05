"use client";

import { WHATSAPP_NUMBER_DISPLAY, whatsappLinkWithMessage } from "@/lib/contact-info";

export function WhatsAppButton() {
  return (
    <a
      href={whatsappLinkWithMessage("Hi TeacherPoint! I have a question.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with us on WhatsApp at ${WHATSAPP_NUMBER_DISPLAY}`}
      title={`WhatsApp: ${WHATSAPP_NUMBER_DISPLAY}`}
      className="fixed bottom-36 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg ring-2 ring-white/40 transition hover:scale-105 hover:bg-[#1ebe57] lg:bottom-24"
    >
      <svg viewBox="0 0 32 32" className="h-6 w-6" fill="currentColor" aria-hidden="true">
        <path d="M19.11 17.49c-.28-.14-1.65-.81-1.9-.9-.26-.1-.44-.14-.63.14-.18.28-.72.9-.88 1.08-.16.18-.32.2-.6.07-.28-.14-1.17-.43-2.23-1.37-.82-.73-1.38-1.63-1.54-1.9-.16-.28-.02-.43.12-.57.13-.13.28-.32.42-.49.14-.16.18-.28.28-.46.09-.18.05-.34-.02-.49-.07-.14-.63-1.51-.86-2.07-.23-.55-.46-.47-.63-.48l-.54-.01c-.18 0-.49.07-.74.34-.26.28-.97.95-.97 2.31s.99 2.68 1.13 2.86c.14.18 1.95 2.98 4.73 4.18.66.29 1.18.46 1.58.59.66.21 1.27.18 1.75.11.53-.08 1.65-.67 1.88-1.32.23-.65.23-1.21.16-1.32-.07-.11-.25-.18-.53-.32zM16.02 5.33c-5.9 0-10.69 4.79-10.69 10.69 0 1.88.49 3.72 1.43 5.34L5 27l5.79-1.51a10.65 10.65 0 0 0 5.22 1.33h.01c5.89 0 10.69-4.79 10.69-10.69s-4.8-10.8-10.69-10.8zm0 19.59h-.01a8.85 8.85 0 0 1-4.52-1.24l-.32-.19-3.43.9.92-3.34-.21-.34a8.86 8.86 0 0 1-1.36-4.71c0-4.9 3.99-8.89 8.93-8.89 2.38 0 4.62.93 6.31 2.62a8.86 8.86 0 0 1 2.61 6.28c-.01 4.9-4 8.91-8.92 8.91z"/>
      </svg>
    </a>
  );
}
