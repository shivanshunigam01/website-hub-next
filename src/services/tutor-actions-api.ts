import { api } from "@/lib/api";
import type { TutorConnection } from "@/services/connections-api";

export type RequestPhoneResult = {
  sent: boolean;
  deliveredTo?: string;
  stub?: boolean;
  unlocked?: boolean;
  phoneMasked?: string | null;
  phone?: string | null;
  status?: string;
  created?: boolean;
  requestEmailSent?: boolean;
  connection?: TutorConnection;
};

export type TutorPaymentResult = {
  paymentId: string;
  status: string;
  invoiceId: string;
  checkoutUrl: string | null;
};

export async function requestTutorPhone(tutorId: string): Promise<RequestPhoneResult> {
  return api<RequestPhoneResult>(`/users/tutors/${tutorId}/request-phone`, { method: "POST" });
}

export async function payTutorSession(input: {
  tutorId: string;
  amount: number;
  currency: string;
  tutorName: string;
  connectionId?: string;
}): Promise<TutorPaymentResult> {
  return api<TutorPaymentResult>("/payments", {
    method: "POST",
    body: JSON.stringify({
      type: "tutor_session",
      referenceId: input.tutorId,
      amount: input.amount,
      currency: input.currency,
      method: "manual",
      metadata: {
        tutorName: input.tutorName,
        teacherId: input.tutorId,
        connectionId: input.connectionId,
      },
    }),
  });
}
