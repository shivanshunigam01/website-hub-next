"use client";

import { Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useMyPayments } from "@/hooks/use-payments-api";
import { formatPrice } from "@/lib/currencies";

export function PaymentsHistoryPanel({ enabled = true }: { enabled?: boolean }) {
  const { data: items = [], isLoading } = useMyPayments(enabled);

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const paid = items.filter((p) => p.status === "paid");
  const total = paid.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const currency = paid[0]?.currency || items[0]?.currency || "INR";

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-card p-5">
          <div className="text-xs text-muted-foreground">Total spent</div>
          <div className="mt-1 font-display text-xl font-extrabold">{formatPrice(total, currency)}</div>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <div className="text-xs text-muted-foreground">Payments</div>
          <div className="mt-1 font-display text-xl font-extrabold">{items.length}</div>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <div className="text-xs text-muted-foreground">Paid</div>
          <div className="mt-1 font-display text-xl font-extrabold">{paid.length}</div>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-5">
        <h2 className="mb-4 font-display font-bold">Invoices</h2>
        {items.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No payments yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-xs">{t.invoiceId || t.id.slice(-8)}</TableCell>
                  <TableCell className="text-sm">
                    {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell className="capitalize">{(t.type || "payment").replace(/_/g, " ")}</TableCell>
                  <TableCell className="capitalize">{t.method || "—"}</TableCell>
                  <TableCell>{formatPrice(Number(t.amount || 0), t.currency || "INR")}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        t.status === "paid"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                          : ""
                      }
                    >
                      {t.status || "—"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
