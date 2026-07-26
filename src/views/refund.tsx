"use client";

import { Link } from "@/lib/navigation";
import { useTranslation } from "react-i18next";
import { RotateCcw, BookOpen, GraduationCap, CreditCard, HelpCircle } from "lucide-react";

type Section = {
  id: string;
  titleKey: string;
  titleDefault: string;
  icon: typeof RotateCcw;
  items: React.ReactNode[];
};

const sections: Section[] = [
  {
    id: "general",
    titleKey: "legal.refund.section.general",
    titleDefault: "General",
    icon: RotateCcw,
    items: [
      "TeacherPoint facilitates payments between students and tutors or for platform services. Refunds are handled according to the product type and the policy below.",
      "All eligible refunds are processed to the original payment method via Razorpay. Bank or UPI processing may take 5–10 business days after approval.",
      "To request a refund, open a ticket at Support with your invoice ID, payment date, and reason. We respond within 2 business days.",
    ],
  },
  {
    id: "courses",
    titleKey: "legal.refund.section.courses",
    titleDefault: "Courses",
    icon: BookOpen,
    items: [
      "Paid courses: full refund within 7 days of purchase if you have completed less than 20% of the course content.",
      "After 7 days, or if more than 20% of lessons are completed, refunds are at the instructor’s discretion unless required by local consumer law.",
      "Free courses and promotional enrollments are not eligible for refunds.",
      "If a course is removed by TeacherPoint due to policy violation, you will receive a full refund or credit.",
    ],
  },
  {
    id: "tutor-sessions",
    titleKey: "legal.refund.section.tutorSessions",
    titleDefault: "Tutor sessions",
    icon: GraduationCap,
    items: [
      "Tutor session payments made through Razorpay on a tutor profile may be refunded if the session was not delivered or was cancelled by the tutor.",
      "Cancel at least 24 hours before a scheduled session for a full refund. Cancellations within 24 hours may incur a 50% fee unless the tutor agrees otherwise.",
      "No-shows by the student are not refundable unless documented as a platform or tutor error.",
      "Disputes between student and tutor should first be raised via Support. We may mediate based on chat logs and booking records.",
    ],
  },
  {
    id: "subscriptions",
    titleKey: "legal.refund.section.subscriptions",
    titleDefault: "Subscriptions & other purchases",
    icon: CreditCard,
    items: [
      "Monthly Pro or subscription plans: cancel anytime; no refund for the current billing period, but access continues until period end.",
      "Workshop registrations: full refund if cancelled 48 hours before start time; 50% refund within 48 hours; no refund after the workshop begins.",
      "Marketplace / Student Exchange listings are peer-to-peer; TeacherPoint does not hold escrow unless payment was made through our checkout. Off-platform payments are not covered by this policy.",
    ],
  },
  {
    id: "contact",
    titleKey: "legal.refund.section.contact",
    titleDefault: "How to request a refund",
    icon: HelpCircle,
    items: [
      <>
        Go to{" "}
        <Link to="/support" className="text-primary font-medium hover:underline">
          Help Center
        </Link>{" "}
        and choose category “Payments”. Include your registered email or phone and Razorpay payment ID if available.
      </>,
      "Approved refunds are initiated within 3 business days. You will receive email confirmation with the refund reference.",
      "Chargebacks filed with your bank without contacting us first may result in account suspension while the dispute is reviewed.",
    ],
  },
];

function RefundPage() {
  const { t } = useTranslation("common");
  return (
    <section className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 ring-1 ring-border">
          <RotateCcw className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight">
            {t("legal.refund.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("legal.refund.updated")}
          </p>
        </div>
      </div>

      <nav className="mt-8 flex flex-wrap gap-2">
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="text-xs font-medium px-3 py-1.5 rounded-full border border-border bg-card hover:border-foreground/20 hover:bg-muted transition-colors"
          >
            {t(s.titleKey, s.titleDefault)}
          </a>
        ))}
      </nav>

      <div className="mt-10 space-y-10">
        {sections.map(({ id, titleKey, titleDefault, icon: Icon, items }) => (
          <article
            key={id}
            id={id}
            className="scroll-mt-24 rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm"
          >
            <header className="flex items-center gap-3 mb-5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                <Icon className="h-4 w-4" />
              </span>
              <h2 className="font-display font-semibold text-xl md:text-2xl">
                {t(titleKey, titleDefault)}
              </h2>
            </header>
            <ul className="space-y-3">
              {items.map((node, i) => (
                <li key={i} className="flex gap-3 text-sm md:text-[0.95rem] text-foreground/80 leading-relaxed">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
                  <span>{node}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">
        Related:{" "}
        <Link to="/terms" className="text-primary font-medium hover:underline">
          Terms and Conditions
        </Link>
        {" · "}
        <Link to="/privacy" className="text-primary font-medium hover:underline">
          Privacy Policy
        </Link>
      </div>
    </section>
  );
}

export default RefundPage;
