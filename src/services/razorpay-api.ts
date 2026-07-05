import { api } from "@/lib/api";

export type RazorpayOrderResponse = {
  order_id: string;
  amount: number;
  currency: string;
};

export type RazorpayVerifyResponse = {
  verified: boolean;
  paymentId: string;
  status: string;
  invoiceId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
};

export type CreateRazorpayOrderInput = {
  amount: number;
  currency?: string;
  receipt?: string;
  type?: "course" | "subscription" | "tutor_session" | "listing" | "combo";
  referenceId?: string;
  metadata?: Record<string, string | number | boolean>;
};

export async function createRazorpayOrder(input: CreateRazorpayOrderInput) {
  return api<RazorpayOrderResponse>("/payments/create-order", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function verifyRazorpayPayment(input: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  type?: CreateRazorpayOrderInput["type"];
  referenceId?: string;
  amount?: number;
  currency?: string;
  metadata?: Record<string, string | number | boolean>;
}) {
  return api<RazorpayVerifyResponse>("/payments/verify-payment", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/** Convert display price to Razorpay paise (INR). */
export function toRazorpayPaise(price: number, currency = "INR"): number {
  const normalized = currency.toUpperCase() === "INR" ? price : price * 83;
  return Math.max(100, Math.round(normalized * 100));
}
