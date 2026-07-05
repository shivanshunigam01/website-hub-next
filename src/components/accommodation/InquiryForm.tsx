"use client";

import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAdminStore, type Accommodation } from "@/hooks/use-admin-store";
import { useLocationContext } from "@/hooks/use-user-location";

const schema = z.object({
  studentName: z.string().trim().min(2, "Enter your full name").max(100),
  email: z.string().trim().email("Valid email required").max(255),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  message: z.string().trim().min(5, "Tell us briefly what you need").max(800),
});

export function InquiryForm({
  accommodation,
  onSubmitted,
}: {
  accommodation?: Accommodation | null;
  onSubmitted?: () => void;
}) {
  const { addInquiry } = useAdminStore();
  const { location, hasLocationAccess } = useLocationContext();
  const [form, setForm] = useState({ studentName: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        errs[i.path[0] as string] = i.message;
      });
      setErrors(errs);
      return;
    }
    addInquiry({
      accommodationId: accommodation?.id,
      accommodationName: accommodation?.name,
      studentName: parsed.data.studentName,
      email: parsed.data.email,
      phone: parsed.data.phone || undefined,
      city: accommodation?.city ?? (hasLocationAccess ? location?.city : undefined) ?? undefined,
      country: accommodation?.country ?? (hasLocationAccess ? location?.country : undefined) ?? undefined,
      message: parsed.data.message,
    });
    toast.success("Thanks! Our accommodation team will reach out within 24 hours.");
    setForm({ studentName: "", email: "", phone: "", message: "" });
    setErrors({});
    onSubmitted?.();
  };

  return (
    <form onSubmit={submit} className="grid gap-3">
      <div>
        <Label htmlFor="iq-name">Full name</Label>
        <Input
          id="iq-name"
          value={form.studentName}
          onChange={(e) => setForm({ ...form, studentName: e.target.value })}
          placeholder="Your full name"
          maxLength={100}
          className="mt-1"
        />
        {errors.studentName && <p className="mt-1 text-xs text-destructive">{errors.studentName}</p>}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="iq-email">Email</Label>
          <Input
            id="iq-email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
            maxLength={255}
            className="mt-1"
          />
          {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
        </div>
        <div>
          <Label htmlFor="iq-phone">Phone (optional)</Label>
          <Input
            id="iq-phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+91 …"
            maxLength={30}
            className="mt-1"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="iq-msg">Your requirements</Label>
        <Textarea
          id="iq-msg"
          rows={3}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Move-in date, budget, preferred amenities…"
          maxLength={800}
          className="mt-1"
        />
        {errors.message && <p className="mt-1 text-xs text-destructive">{errors.message}</p>}
      </div>
      <Button type="submit" size="lg" variant="gradient" className="w-full">
        Send enquiry
      </Button>
    </form>
  );
}
