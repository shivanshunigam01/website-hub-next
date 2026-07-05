"use client";

import { Download, CreditCard } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const TX = [
  { id: "INV-1042", date: "May 12, 2026", item: "AI Coding Agents Course", amount: 19, method: "Stripe", status: "Paid" },
  { id: "INV-1039", date: "May 02, 2026", item: "Pro plan · monthly", amount: 19, method: "Razorpay", status: "Paid" },
  { id: "INV-1031", date: "Apr 18, 2026", item: "Tutor session · Emma S.", amount: 35, method: "PayPal", status: "Paid" },
  { id: "INV-1024", date: "Apr 02, 2026", item: "Pro plan · monthly", amount: 19, method: "Stripe", status: "Paid" },
];

function Payments() {
  return (
    <section className="container mx-auto px-4 py-10">
      <h1 className="font-display font-extrabold text-3xl">Payments & invoices</h1>
      <p className="text-muted-foreground mt-2">All your transactions in one place.</p>

      <div className="grid sm:grid-cols-3 gap-4 my-6">
        {[["Total spent", "$284"], ["Active plan", "Pro"], ["Next bill", "Jun 02"]].map(([l, v]) => (
          <div key={l} className="bg-card border rounded-2xl p-5"><div className="text-xs text-muted-foreground">{l}</div><div className="font-display font-extrabold text-xl mt-1">{v}</div></div>
        ))}
      </div>

      <div className="bg-card border rounded-2xl p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-display font-bold">Invoices</h2>
          <Button size="sm" variant="outline"><CreditCard className="h-4 w-4 mr-2" />Update card</Button>
        </div>
        <Table>
          <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Date</TableHead><TableHead>Item</TableHead><TableHead>Method</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>
            {TX.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-mono text-xs">{t.id}</TableCell>
                <TableCell className="text-sm">{t.date}</TableCell>
                <TableCell>{t.item}</TableCell>
                <TableCell>{t.method}</TableCell>
                <TableCell>${t.amount}</TableCell>
                <TableCell><Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">{t.status}</Badge></TableCell>
                <TableCell><Button size="sm" variant="ghost" aria-label="Download invoice"><Download className="h-4 w-4" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

export default Payments;
