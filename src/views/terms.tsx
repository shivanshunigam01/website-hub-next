"use client";

import { Link } from "@/lib/navigation";
import { useTranslation } from "react-i18next";
import { ShieldCheck, GraduationCap, Users, FileText } from "lucide-react";

type Section = {
  id: string;
  titleKey: string;
  titleDefault: string;
  icon: typeof ShieldCheck;
  items: React.ReactNode[];
};

const sections: Section[] = [
  {
    id: "general",
    titleKey: "legal.terms.section.general",
    titleDefault: "General",
    icon: ShieldCheck,
    items: [
      "You may not create multiple accounts. One person should have only one account — failing this may result in all your accounts being banned.",
      "You are responsible for your money and safety when dealing with others. Please do your due diligence; we do our best to do our part.",
      <>
        We reserve the right to suspend your account at any time without notice. This includes
        discrediting your <Link to="/" className="text-primary font-medium hover:underline">coins</Link> balance.
      </>,
      "We reserve the right to add your name to our public scammer list if abuse is reported and verified.",
    ],
  },
  {
    id: "students",
    titleKey: "legal.terms.section.students",
    titleDefault: "For Students",
    icon: Users,
    items: [
      "You may not share contact details in a job posting. Accounts that do so are automatically banned.",
      "If you choose to share your contact details with a tutor, it is your responsibility to verify their credentials, identity, and background.",
      "You are responsible for any monetary transactions and refunds. We are not liable for fraudulent activity.",
      "We may call the phone number you provide to confirm your requirements. We will never spam you with promotions on this phone.",
    ],
  },
  {
    id: "tutors",
    titleKey: "legal.terms.section.tutors",
    titleDefault: "For Tutors",
    icon: GraduationCap,
    items: [
      "We do not vet students for credit history or payment record. It is your responsibility to check their credentials and manage payments and refunds.",
      "Your profile will be permanently banned if you share contact details unless specifically asked to do so.",
      "We may call the phone number you provide regarding your account. We will never spam you with promotions on this phone.",
    ],
  },
];

function TermsPage() {
  const { t } = useTranslation("common");
  return (
    <section className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 ring-1 ring-border">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight">
            {t("legal.terms.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("legal.terms.updated", { year: new Date().getFullYear() })}
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
        By creating an account on TeacherPoint, you confirm that you have read and agree to these
        Terms, our{" "}
        <Link to="/privacy" className="text-primary font-medium hover:underline">
          Privacy Policy
        </Link>{" "}
        and{" "}
        <Link to="/refund" className="text-primary font-medium hover:underline">
          Refund Policy
        </Link>
        . If you do not agree, please do not use the service.
      </div>
    </section>
  );
}

export default TermsPage;
