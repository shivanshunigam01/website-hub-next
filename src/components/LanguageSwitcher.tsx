"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Globe, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocationContext } from "@/hooks/use-user-location";
import {
  applyManualLanguage,
  canApplyViaI18n,
  GT_LANGUAGES,
  suggestLanguageForLocation,
} from "@/lib/google-translate";
import { syncDocumentLanguage } from "@/lib/document-language";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation("common");
  const { location, isLoading, hasLocationAccess } = useLocationContext();

  const current = i18n.language === "zh" ? "zh-CN" : i18n.language;

  const { recommended, others } = useMemo(() => {
    const loc = isLoading || !hasLocationAccess ? null : location;
    const suggested = suggestLanguageForLocation(loc);
    const bundled = GT_LANGUAGES.filter((l) => canApplyViaI18n(l.code));
    const recCodes = new Set<string>(["en"]);
    if (suggested !== "en" && canApplyViaI18n(suggested)) recCodes.add(suggested);

    const rec = bundled.filter((l) => recCodes.has(l.code));
    const oth = bundled.filter((l) => !recCodes.has(l.code));
    return { recommended: rec, others: oth };
  }, [location, isLoading, hasLocationAccess]);

  const select = (code: string) => {
    if (code === current) return;
    applyManualLanguage(code, location?.countryCode?.toUpperCase(), (lng) => {
      void i18n.changeLanguage(lng);
      syncDocumentLanguage(lng);
    });
  };

  const renderPill = (lang: (typeof GT_LANGUAGES)[number]) => {
    const active = current === lang.code;
    return (
      <button
        key={lang.code}
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          select(lang.code);
        }}
        translate="no"
        className={cn(
          "notranslate group relative flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-left text-sm transition-all",
          "hover:border-primary hover:bg-primary/5 hover:shadow-sm",
          active && "border-primary bg-primary/10 ring-1 ring-primary/30",
        )}
      >
        <span className="text-base leading-none">{lang.flag}</span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className={cn("truncate font-medium leading-tight", active && "text-primary")}>
            {lang.native}
          </span>
          <span className="truncate text-[10px] text-muted-foreground leading-tight">
            {lang.english}
          </span>
        </span>
        {active && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
      </button>
    );
  };

  const SectionLabel = ({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) => (
    <div className="mb-2 flex items-center gap-1.5 px-1">
      {icon}
      <h4 className="font-display text-sm font-semibold text-primary">{children}</h4>
      <div className="ml-2 h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
    </div>
  );

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="shrink-0 sm:flex" aria-label={t("nav.language")}>
          <Globe className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[min(100vw-2rem,22rem)] max-h-[75vh] overflow-y-auto p-3 notranslate"
        translate="no"
      >
        {recommended.length > 0 && (
          <div className="mb-4">
            <SectionLabel>{t("lang.suggested")}</SectionLabel>
            <div className="grid grid-cols-2 gap-2">
              {recommended.map(renderPill)}
            </div>
          </div>
        )}

        <div>
          <SectionLabel icon={<Globe className="h-3.5 w-3.5 text-primary" />}>
            {t("lang.allLanguages")}
          </SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            {others.map(renderPill)}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
