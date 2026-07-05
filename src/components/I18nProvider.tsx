"use client";

import { useEffect, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";
import { useAutoLanguageFromLocation } from "@/hooks/useAutoLanguageFromLocation";
import { useLocationContext } from "@/hooks/use-user-location";
import { syncDocumentLanguage } from "@/lib/document-language";
import { LtrLayoutGuard } from "@/components/LtrLayoutGuard";

const LANGUAGE_KEY = "selectedLanguage";

function getStoredLanguage() {
  if (typeof window === "undefined") return "en";
  return localStorage.getItem(LANGUAGE_KEY) || "en";
}

function AutoLanguageFromGeo() {
  const { location, isLoading } = useLocationContext();
  useAutoLanguageFromLocation(isLoading ? undefined : location);
  return null;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const storedLanguage = getStoredLanguage();
    if (storedLanguage && i18n.language !== storedLanguage) {
      void i18n.changeLanguage(storedLanguage);
    }

    syncDocumentLanguage(i18n.language);
    const onChange = (lng: string) => syncDocumentLanguage(lng);
    i18n.on("languageChanged", onChange);
    return () => {
      i18n.off("languageChanged", onChange);
    };
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <LtrLayoutGuard />
      <AutoLanguageFromGeo />
      {children}
    </I18nextProvider>
  );
}
