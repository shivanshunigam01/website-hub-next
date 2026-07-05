import { api } from "@/lib/api";

export type RequestPhoneResult = {
  sent: boolean;
  deliveredTo: string;
  stub?: boolean;
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
}): Promise<TutorPaymentResult> {
  return api<TutorPaymentResult>("/payments", {
    method: "POST",
    body: JSON.stringify({
      type: "tutor_session",
      referenceId: input.tutorId,
      amount: input.amount,
      currency: input.currency,
      method: "manual",
      metadata: { tutorName: input.tutorName },
    }),
  });
}
