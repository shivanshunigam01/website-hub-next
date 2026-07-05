"use client";


import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { WHATSAPP_NUMBER_DISPLAY, whatsappLinkWithMessage } from "@/lib/contact-info";



function Contact() {
  return (
    <section className="container mx-auto px-4 py-16 max-w-5xl grid md:grid-cols-2 gap-10">
      <div>
        <h1 className="font-display font-extrabold text-4xl">Let's talk</h1>
        <p className="text-muted-foreground mt-3">Questions, partnerships, or feedback — we'd love to hear from you.</p>
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
              WhatsApp {WHATSAPP_NUMBER_DISPLAY}
            </a>
          </li>
          <li className="flex items-center gap-3"><MapPin className="h-5 w-5 text-primary" />San Francisco · Bengaluru · London</li>
        </ul>
      </div>
      <form className="bg-card border rounded-2xl p-6 space-y-4" onSubmit={(e) => { e.preventDefault(); toast.success("Message sent! We'll reply within 24 hours."); }}>
        <div><Label>Name</Label><Input required className="mt-1" /></div>
        <div><Label>Email</Label><Input required type="email" className="mt-1" /></div>
        <div><Label>Subject</Label><Input required className="mt-1" /></div>
        <div><Label>Message</Label><textarea required className="w-full border rounded-lg p-3 text-sm min-h-[140px] mt-1" /></div>
        <Button type="submit" size="lg" variant="gradient" className="w-full">Send message</Button>
      </form>
    </section>
  );
}

export default Contact;
