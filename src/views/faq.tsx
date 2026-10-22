"use client";

import { useTranslation } from "react-i18next";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SEO_FAQ_ITEMS } from "@/lib/seo-faq";

function FAQ() {
  const { t } = useTranslation("common");
  return (
    <section className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="font-display font-extrabold text-4xl">{t("faq.title", "Frequently asked questions")}</h1>
      <p className="text-muted-foreground mt-3 mb-4">
        {t("faq.pageSubtitle", "Everything you need to know about TeacherPoint.")}
      </p>
      <div className="prose prose-sm dark:prose-invert mb-8 max-w-none text-muted-foreground">
        <p>
          TeacherPoint helps students and parents discover tutors, post learning requirements, enroll in published
          courses, and pay for tutor connections through Razorpay with server-side payment verification. Teachers
          complete a profile, apply to approved jobs, and manage courses through the tutor dashboard and LMS tools.
        </p>
        <p>
          Use <strong>Find a Tutor</strong> for online or home tutoring, <strong>Tutor Jobs</strong> for openings,
          and the <strong>Refund &amp; Cancellation Policy</strong> for purchase rules.
        </p>
      </div>
      <Accordion type="single" collapsible className="bg-card border rounded-2xl px-6">
        {SEO_FAQ_ITEMS.map((item, i) => (
          <AccordionItem key={i} value={`f${i}`}>
            <AccordionTrigger className="text-left font-semibold">{item.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

export default FAQ;
