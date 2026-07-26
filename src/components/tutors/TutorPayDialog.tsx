"use client";

import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard } from "lucide-react";
import { useCurrency } from "@/hooks/use-currency";
import type { Tutor } from "@/types/catalog";

type TutorPayDialogProps = {
  tutor: Tutor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paying: boolean;
  onConfirm: () => void;
};

export function TutorPayDialog({ tutor, open, onOpenChange, paying, onConfirm }: TutorPayDialogProps) {
  const { t } = useTranslation("common");
  const { formatLocalizedPrice, currency: visitorCurrency } = useCurrency();
  const displayPrice = formatLocalizedPrice(tutor.price, tutor.currency);
  const showListedNote =
    tutor.currency && tutor.currency.toUpperCase() !== visitorCurrency.toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">
            {t("tutorPay.title", "Pay {{name}}", { name: tutor.name })}
          </DialogTitle>
          <DialogDescription>
            {t(
              "tutorPay.description",
              "Pay securely with Razorpay (UPI, cards, net banking). You will receive an invoice by email.",
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border bg-muted/30 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("support.cat.tutor")}</span>
            <span className="font-medium">{tutor.name}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {t("tutorPay.sessionRate", "Session rate")}
            </span>
            <span className="font-display text-lg font-bold">
              {displayPrice}
              <span className="text-sm font-normal text-muted-foreground">
                {t("tutorPay.perHour", "/hour")}
              </span>
            </span>
          </div>
          {showListedNote && (
            <p className="mt-2 text-xs text-muted-foreground">
              {t(
                "tutorPay.listedNote",
                "Listed in {{currency}} · checkout via Razorpay in INR",
                { currency: tutor.currency },
              )}
            </p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={paying}>
            {t("tutorPay.cancel", "Cancel")}
          </Button>
          <Button variant="gradient" onClick={onConfirm} disabled={paying}>
            {paying ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CreditCard className="mr-2 h-4 w-4" />
            )}
            {t("tutorPay.payButton", "Pay with Razorpay")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
