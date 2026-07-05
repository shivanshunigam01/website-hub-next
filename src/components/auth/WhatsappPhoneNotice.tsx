"use client";

import { MessageCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function WhatsappPhoneNotice() {
  return (
    <Alert className="border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
      <MessageCircle className="h-4 w-4" />
      <AlertDescription className="text-sm">
        Your WhatsApp-verified number is filled in automatically and cannot be changed here, so it
        stays the same as the number you used to sign in.
      </AlertDescription>
    </Alert>
  );
}
