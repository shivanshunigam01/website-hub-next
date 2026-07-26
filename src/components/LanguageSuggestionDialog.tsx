"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocationContext } from "@/hooks/use-user-location";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  applyManualLanguage,
  getCurrentLanguage,
  getLanguageMeta,
  LS_KEYS,
  markManualLanguageChoice,
  suggestLanguageForLocation,
} from "@/lib/google-translate";
import { syncDocumentLanguage } from "@/lib/document-language";
import { completeLanguagePrompt, ONBOARDING_POPUPS_ENABLED } from "@/lib/popup-sequence";

export function LanguageSuggestionDialog() {
  const { t, i18n } = useTranslation("common");
  const { location, isLoading, hasLocationAccess } = useLocationContext();
  const [open, setOpen] = useState(false);
  const [suggested, setSuggested] = useState<string>("en");

  useEffect(() => {
    if (!ONBOARDING_POPUPS_ENABLED) {
      completeLanguagePrompt();
      return;
    }

    if (isLoading || !hasLocationAccess || !location) {
      if (!isLoading && !hasLocationAccess) {
        completeLanguagePrompt();
      }
      return;
    }
    if (typeof window === "undefined") return;

    if (localStorage.getItem(LS_KEYS.prompted)) {
      completeLanguagePrompt();
      return;
    }
    if (localStorage.getItem(LS_KEYS.selected)) {
      completeLanguagePrompt();
      return;
    }

    const code = suggestLanguageForLocation(location);
    if (code === "en") {
      completeLanguagePrompt();
      return;
    }
    if (getCurrentLanguage() === code) {
      localStorage.setItem(LS_KEYS.prompted, "1");
      completeLanguagePrompt();
      return;
    }

    setSuggested(code);
    setOpen(true);
  }, [location, isLoading, hasLocationAccess]);

  if (!ONBOARDING_POPUPS_ENABLED) return null;

  const meta = getLanguageMeta(suggested);

  const applyLang = (code: string) => {
    applyManualLanguage(code, location?.countryCode?.toUpperCase(), (lng) => {
      void i18n.changeLanguage(lng);
      syncDocumentLanguage(lng);
    });
  };

  const decline = () => {
    markManualLanguageChoice("en", location?.countryCode?.toUpperCase());
    completeLanguagePrompt();
    if (i18n.language !== "en") {
      applyLang("en");
    }
    setOpen(false);
  };

  const accept = () => {
    completeLanguagePrompt();
    applyLang(suggested);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : decline())}>
      <DialogContent className="sm:max-w-md notranslate" translate="no">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-4xl leading-none">
            {meta.flag}
          </div>
          <DialogTitle className="text-center text-xl">
            {t("lang.suggestTitle", { native: meta.native })}
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            {t("lang.suggestDesc", { native: meta.native, english: meta.english })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2 sm:justify-center">
          <Button variant="outline" size="lg" onClick={decline}>
            {t("lang.keepEnglish")}
          </Button>
          <Button size="lg" variant="gradient" onClick={accept}>
            <span className="mr-1.5">{meta.flag}</span>
            {t("lang.switchTo", { native: meta.native })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
