import { api } from "@/lib/api";

export type PaymentRecord = {
  id: string;
  userId?: string;
  type?: string;
  referenceId?: string;
  amount?: number;
  currency?: string;
  method?: string;
  status?: string;
  invoiceId?: string;
  contactUnlocked?: boolean;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
};

export async function fetchMyPayments(): Promise<PaymentRecord[]> {
  const data = await api<PaymentRecord[] | { items: PaymentRecord[] }>("/payments/me");
  return Array.isArray(data) ? data : (data.items ?? []);
}

export async function fetchReceivedPayments(): Promise<PaymentRecord[]> {
  const data = await api<PaymentRecord[] | { items: PaymentRecord[] }>("/payments/received");
  return Array.isArray(data) ? data : (data.items ?? []);
}
