"use client";

import { useEffect } from "react";
import { enforceLtrLayout, syncDocumentLanguage } from "@/lib/document-language";
import { getCurrentLanguage, gtToI18nCode } from "@/lib/google-translate";

/** One-time LTR + lang sync on mount (no observers — those freeze the page with Google Translate). */
export function LtrLayoutGuard() {
  useEffect(() => {
    syncDocumentLanguage(gtToI18nCode(getCurrentLanguage()));
    enforceLtrLayout();
  }, []);

  return null;
}
