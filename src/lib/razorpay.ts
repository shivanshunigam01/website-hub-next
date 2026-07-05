"use client";

import { createRazorpayOrder, verifyRazorpayPayment, type CreateRazorpayOrderInput } from "@/services/razorpay-api";

const SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

type RazorpayHandlerResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayCheckoutOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: RazorpayHandlerResponse) => void;
  modal?: { ondismiss?: () => void };
};

type RazorpayInstance = {
  open: () => void;
  on: (event: string, handler: (response: { error?: { description?: string } }) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayInstance;
  }
}

let scriptPromise: Promise<void> | null = null;

function loadRazorpayScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("Razorpay requires a browser"));
  if (window.Razorpay) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_URL}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Razorpay")));
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay checkout script"));
    document.body.appendChild(script);
  });

  return scriptPromise;
}

export type RazorpayCheckoutInput = CreateRazorpayOrderInput & {
  description?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
};

export async function openRazorpayCheckout(input: RazorpayCheckoutInput): Promise<RazorpayHandlerResponse> {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  if (!keyId) {
    throw new Error("Razorpay is not configured. Set NEXT_PUBLIC_RAZORPAY_KEY_ID in your .env file.");
  }

  await loadRazorpayScript();
  if (!window.Razorpay) {
    throw new Error("Razorpay checkout script failed to initialize");
  }

  const order = await createRazorpayOrder({
    amount: input.amount,
    currency: input.currency || "INR",
    receipt: input.receipt,
    type: input.type,
    referenceId: input.referenceId,
    metadata: input.metadata,
  });

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay!({
      key: keyId,
      amount: order.amount,
      currency: order.currency,
      name: "TeacherPoint",
      description: input.description,
      order_id: order.order_id,
      prefill: {
        name: input.customerName,
        email: input.customerEmail,
        contact: input.customerPhone,
      },
      theme: { color: "#2563eb" },
      handler: (response) => resolve(response),
      modal: {
        ondismiss: () => reject(new Error("Payment cancelled")),
      },
    });

    rzp.on("payment.failed", (response) => {
      reject(new Error(response.error?.description || "Payment failed"));
    });

    rzp.open();
  });
}

export async function completeRazorpayCheckout(
  checkout: RazorpayCheckoutInput,
): Promise<{ paymentId: string; invoiceId: string }> {
  const response = await openRazorpayCheckout(checkout);
  const verified = await verifyRazorpayPayment({
    razorpay_order_id: response.razorpay_order_id,
    razorpay_payment_id: response.razorpay_payment_id,
    razorpay_signature: response.razorpay_signature,
    type: checkout.type,
    referenceId: checkout.referenceId,
    amount: checkout.amount / 100,
    currency: checkout.currency || "INR",
    metadata: checkout.metadata,
  });
  return { paymentId: verified.paymentId, invoiceId: verified.invoiceId };
}
