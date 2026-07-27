"use client";

import { PaymentsHistoryPanel } from "@/components/dashboard/PaymentsHistoryPanel";
import { RequireAuth } from "@/components/auth/RequireAuth";

function Payments() {
  return (
    <RequireAuth roles={["student", "parent", "teacher"]}>
      <section className="container mx-auto px-4 py-10">
        <h1 className="font-display text-3xl font-extrabold">Payments & invoices</h1>
        <p className="mt-2 text-muted-foreground">All your transactions in one place.</p>
        <div className="mt-6">
          <PaymentsHistoryPanel />
        </div>
      </section>
    </RequireAuth>
  );
}

export default Payments;
