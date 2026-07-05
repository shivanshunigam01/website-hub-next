"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FAQS } from "@/data/mock";
import { canonicalUrl } from "@/lib/site-config";

function FAQ() {
  return (
    <section className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="font-display font-extrabold text-4xl">Frequently asked questions</h1>
      <p className="text-muted-foreground mt-3 mb-8">Everything you need to know about TeacherPoint.</p>
      <Accordion type="single" collapsible className="bg-card border rounded-2xl px-6">
        {FAQS.map((f, i) => (
          <AccordionItem key={i} value={`f${i}`}>
            <AccordionTrigger className="text-left font-semibold">{f.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

export default FAQ;
