"use client";

import { Lock, Unlock, Phone, Mail, MessageCircle, ShieldCheck, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type ContactInfo = {
  name: string;
  email: string;
  phone: string;
  whatsapp?: string;
};

/** Card shown to the student BEFORE payment — masks teacher PII. */
export function LockedContactCard({
  contact,
  amount,
  onPay,
  loading,
}: {
  contact: ContactInfo;
  amount: number;
  onPay: () => void;
  loading?: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-muted/40 via-background to-primary/5 p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Tutor contact
          </div>
          <div className="mt-0.5 font-display font-bold text-lg">{contact.name}</div>
        </div>
        <Badge variant="outline" className="gap-1 border-amber-400/40 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
          <Lock className="h-3 w-3" /> Locked
        </Badge>
      </div>

      <ul className="space-y-2 text-sm mb-4">
        <li className="flex items-center gap-2 text-muted-foreground">
          <Phone className="h-4 w-4" /> +•• ••••• ••{contact.phone.slice(-2)}
        </li>
        <li className="flex items-center gap-2 text-muted-foreground">
          <Mail className="h-4 w-4" /> ••••@{contact.email.split("@")[1] ?? "•••"}
        </li>
        <li className="flex items-center gap-2 text-muted-foreground">
          <MessageCircle className="h-4 w-4" /> WhatsApp hidden until payment
        </li>
      </ul>

      <div className="rounded-xl border bg-card p-3 flex items-center justify-between gap-3 mb-3">
        <div>
          <div className="text-xs text-muted-foreground">Total</div>
          <div className="text-lg font-bold">${amount.toLocaleString()}</div>
        </div>
        <Button size="default" variant="gradient" onClick={onPay} disabled={loading}>
          <CreditCard className="h-4 w-4 mr-1.5" />
          {loading ? "Processing…" : "Pay & unlock contact"}
        </Button>
      </div>

      <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
        <ShieldCheck className="h-3 w-3" /> Mock payment — no real charge is made.
      </p>
    </div>
  );
}

/** Card shown to the student AFTER mock payment success. */
export function UnlockedContactCard({ contact }: { contact: ContactInfo }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-emerald-50 via-background to-primary/5 dark:from-emerald-900/20 p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            Contact unlocked
          </div>
          <div className="mt-0.5 font-display font-bold text-lg">{contact.name}</div>
        </div>
        <Badge className="gap-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
          <Unlock className="h-3 w-3" /> Unlocked
        </Badge>
      </div>

      <ul className="space-y-2 text-sm">
        <li className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-emerald-600" />
          <a className="font-medium hover:underline" href={`tel:${contact.phone}`}>{contact.phone}</a>
        </li>
        <li className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-emerald-600" />
          <a className="font-medium hover:underline" href={`mailto:${contact.email}`}>{contact.email}</a>
        </li>
        {contact.whatsapp && (
          <li className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-emerald-600" />
            <a
              className="font-medium hover:underline"
              href={`https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp {contact.whatsapp}
            </a>
          </li>
        )}
      </ul>
    </div>
  );
}
