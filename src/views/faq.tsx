"use client";

import { useTranslation } from "react-i18next";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FAQS } from "@/data/mock";

function FAQ() {
  const { t } = useTranslation("common");
  return (
    <section className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="font-display font-extrabold text-4xl">{t("faq.title")}</h1>
      <p className="text-muted-foreground mt-3 mb-8">{t("faq.pageSubtitle")}</p>
      <Accordion type="single" collapsible className="bg-card border rounded-2xl px-6">
        {FAQS.map((_, i) => (
          <AccordionItem key={i} value={`f${i}`}>
            <AccordionTrigger className="text-left font-semibold">
              {t(`faq.${i + 1}.q`)}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {t(`faq.${i + 1}.a`)}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

export default FAQ;
