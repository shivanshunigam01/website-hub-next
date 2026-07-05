"use client";

import { Link } from "@/lib/navigation";
import { Eye, Lock, Database, Mail, FileText } from "lucide-react";

type Section = {
  id: string;
  title: string;
  icon: typeof Eye;
  items: React.ReactNode[];
};

const sections: Section[] = [
  {
    id: "overview",
    title: "Overview",
    icon: Eye,
    items: [
      "TeacherPoint (“we”, “us”, “our”) operates an online marketplace connecting students, parents, and tutors for courses, tutoring sessions, and related services.",
      "This Privacy Policy explains what information we collect, how we use it, who we share it with, and the choices you have. By using TeacherPoint, you agree to this policy.",
      "We may update this policy from time to time. Material changes will be posted on this page with an updated date.",
    ],
  },
  {
    id: "collection",
    title: "Information we collect",
    icon: Database,
    items: [
      "Account details: name, email address, phone number (including WhatsApp), password hash, profile photo, role (student, tutor, parent), and preferences.",
      "Profile and listing data: subjects, qualifications, bio, location (city/country), availability, course content, reviews, and messages you choose to share.",
      "Payment data: transaction amounts, currency, invoice IDs, and payment status. Card and UPI details are processed by Razorpay; we do not store full card numbers on our servers.",
      "Usage data: pages visited, search queries, device type, browser, IP address, and cookies used to keep you signed in and improve the service.",
      "Communications: support tickets, emails, and OTP messages sent for account verification.",
    ],
  },
  {
    id: "use",
    title: "How we use your information",
    icon: Lock,
    items: [
      "Provide and improve the platform: authentication, tutor matching, course enrollment, messaging, and customer support.",
      "Process payments and issue invoices through our payment partner Razorpay.",
      "Send service messages such as OTP codes, booking confirmations, and account alerts. Marketing emails are sent only if you opt in.",
      "Detect fraud, enforce our Terms, and comply with applicable law.",
      "Analyse aggregated usage to improve search, recommendations, and product features.",
    ],
  },
  {
    id: "sharing",
    title: "When we share information",
    icon: Mail,
    items: [
      "With tutors or students when you book a session, enroll in a course, or unlock contact details after payment — only the information needed to deliver the service.",
      "With service providers: cloud hosting, email (SMTP), media storage (Cloudinary), maps/location (Geoapify), WhatsApp OTP (AiSensy), and payments (Razorpay). They process data on our behalf under contractual obligations.",
      "When required by law, court order, or to protect the rights, safety, and property of TeacherPoint, our users, or the public.",
      "We do not sell your personal information to third-party advertisers.",
    ],
  },
  {
    id: "rights",
    title: "Your rights & retention",
    icon: FileText,
    items: [
      "You may access, correct, or delete your profile data from your account settings or by contacting support.",
      "You may opt out of marketing emails at any time using the unsubscribe link or by writing to us.",
      "We retain account data while your account is active and for a reasonable period afterward for legal, tax, and dispute-resolution purposes.",
      "Payment records may be kept for up to seven years as required for accounting and regulatory compliance.",
      <>
        For privacy requests, contact us at{" "}
        <Link to="/contact" className="text-primary font-medium hover:underline">
          Contact support
        </Link>
        .
      </>,
    ],
  },
];

function PrivacyPage() {
  return (
    <section className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 ring-1 ring-border">
          <Lock className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Last updated · June 2026. Applies to all TeacherPoint users worldwide.
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
            {s.title}
          </a>
        ))}
      </nav>

      <div className="mt-10 space-y-10">
        {sections.map(({ id, title, icon: Icon, items }) => (
          <article
            key={id}
            id={id}
            className="scroll-mt-24 rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm"
          >
            <header className="flex items-center gap-3 mb-5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                <Icon className="h-4 w-4" />
              </span>
              <h2 className="font-display font-semibold text-xl md:text-2xl">{title}</h2>
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
        See also our{" "}
        <Link to="/terms" className="text-primary font-medium hover:underline">
          Terms and Conditions
        </Link>{" "}
        and{" "}
        <Link to="/refund" className="text-primary font-medium hover:underline">
          Refund Policy
        </Link>
        .
      </div>
    </section>
  );
}

export default PrivacyPage;
