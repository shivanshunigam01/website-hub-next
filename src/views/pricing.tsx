"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PAYMENT_PLANS } from "@/data/mock";
import { canonicalUrl } from "@/lib/site-config";

function Pricing() {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <h1 className="font-display font-extrabold text-4xl">Simple pricing for every learner</h1>
        <p className="text-muted-foreground mt-2">Start free. Upgrade anytime. Cancel anytime.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {PAYMENT_PLANS.map((p) => (
          <div key={p.name} className={`rounded-3xl border p-8 ${p.highlight ? "bg-gradient-primary text-primary-foreground border-transparent shadow-card scale-105" : "bg-card"}`}>
            {p.highlight && <Badge className="bg-white/20 mb-2">Most popular</Badge>}
            <h3 className="font-display font-bold text-2xl">{p.name}</h3>
            <div className="mt-3"><span className="font-display font-extrabold text-4xl">${p.price}</span><span className={p.highlight ? "opacity-80" : "text-muted-foreground"}>/{p.period}</span></div>
            <ul className="mt-6 space-y-2.5">
              {p.features.map((f) => (<li key={f} className="flex items-start gap-2 text-sm"><Check className="h-4 w-4 mt-0.5 shrink-0" />{f}</li>))}
            </ul>
            <Button className={`mt-6 w-full ${p.highlight ? "bg-white text-primary hover:bg-white/90" : ""}`} size="lg" variant={p.highlight ? "secondary" : "gradient"}>{p.cta}</Button>
          </div>
        ))}
      </div>
      <div className="mt-12 text-center text-sm text-muted-foreground">
        Accepted: Razorpay · Stripe · PayPal · UPI · Cards · Net Banking · Multi-currency
      </div>
    </section>
  );
}

export default Pricing;
