"use client";

import { useTranslation } from "react-i18next";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { WHATSAPP_NUMBER_DISPLAY, whatsappLinkWithMessage } from "@/lib/contact-info";

function Contact() {
  const { t } = useTranslation("common");
  return (
    <section className="container mx-auto px-4 py-16 max-w-5xl grid md:grid-cols-2 gap-10">
      <div>
        <h1 className="font-display font-extrabold text-4xl">{t("contact.title")}</h1>
        <p className="text-muted-foreground mt-3">{t("contact.subtitle")}</p>
        <ul className="mt-8 space-y-4 text-sm">
          <li className="flex items-center gap-3"><Mail className="h-5 w-5 text-primary" />hello@teacherpoint.org</li>
          <li className="flex items-center gap-3"><Phone className="h-5 w-5 text-primary" />{WHATSAPP_NUMBER_DISPLAY}</li>
          <li className="flex items-center gap-3">
            <MessageCircle className="h-5 w-5 text-[#25D366]" />
            <a
              href={whatsappLinkWithMessage("Hi TeacherPoint! I have a question.")}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {t("contact.whatsapp", { number: WHATSAPP_NUMBER_DISPLAY })}
            </a>
          </li>
          <li className="flex items-center gap-3"><MapPin className="h-5 w-5 text-primary" />{t("contact.locations")}</li>
        </ul>
      </div>
      <form className="bg-card border rounded-2xl p-6 space-y-4" onSubmit={(e) => { e.preventDefault(); toast.success(t("contact.toastSent")); }}>
        <div><Label>{t("contact.name")}</Label><Input required className="mt-1" /></div>
        <div><Label>{t("contact.email")}</Label><Input required type="email" className="mt-1" /></div>
        <div><Label>{t("contact.subject")}</Label><Input required className="mt-1" /></div>
        <div><Label>{t("contact.message")}</Label><textarea required className="w-full border rounded-lg p-3 text-sm min-h-[140px] mt-1" /></div>
        <Button type="submit" size="lg" variant="gradient" className="w-full">{t("contact.send")}</Button>
      </form>
    </section>
  );
}

export default Contact;
