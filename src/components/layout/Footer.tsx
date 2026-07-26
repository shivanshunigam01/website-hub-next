"use client";

import { useState } from "react";
import { Link } from "@/lib/navigation";
import { Globe, Mail, Share2 } from "lucide-react";
import { SOCIAL_LINKS } from "@/lib/site-config";
import { BrandLogo } from "@/components/BrandLogo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { formatApiErrorMessage } from "@/lib/api";
import { subscribeNewsletter } from "@/services/contact-api";

import { POPULAR_SUBJECT_LINKS } from "@/lib/seo-keywords";

export function Footer() {
  const { t } = useTranslation("common");
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const cols = [
    {
      title: t("footer.learn"),
      links: [
        { to: "/courses", label: t("footer.allCourses") },
        { to: "/tutors", label: t("footer.findTutor") },
        { to: "/marketplace", label: t("footer.marketplace") },
        { to: "/pricing", label: t("footer.pricing") },
      ],
    },
    {
      title: t("footer.brand"),
      links: [
        { to: "/about", label: t("footer.about") },
        { to: "/contact", label: t("footer.contact") },
        { to: "/faq", label: t("footer.faq") },
        { to: "/post-requirement", label: t("footer.postRequirement") },
        { to: "/role-select", label: t("footer.becomeTeacher") },
      ],
    },
    {
      title: t("footer.supportTitle"),
      links: [
        { to: "/support", label: t("footer.helpCenter") },
        { to: "/reviews", label: t("footer.reviews") },
        { to: "/messages", label: t("nav.messages") },
        { to: "/contact", label: t("footer.reportIssue") },
      ],
    },
  ];

  const onSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!value) return;
    setSubscribing(true);
    try {
      await subscribeNewsletter(value);
      toast.success(t("footer.subscribeSuccess", "You're subscribed — check your inbox for tips."));
      setEmail("");
    } catch (err) {
      toast.error(formatApiErrorMessage(err, t("footer.subscribeFailed", "Could not subscribe. Please try again.")));
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="mt-16 bg-[#0b1220] text-slate-300">
      <div className="container mx-auto px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-12">
          <h3 className="text-white font-display text-lg mb-4">{t("footer.popularSkills")}</h3>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SUBJECT_LINKS.slice(0, 24).map(({ label, subject }) => (
              <Link
                key={subject}
                to="/tutors"
                search={{ subject }}
                className="text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 transition"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <div className="mb-4">
              <BrandLogo size="footer" />
            </div>
            <p className="text-sm text-slate-400 max-w-sm mb-4">{t("footer.tagline")}</p>
            <div className="flex flex-wrap items-center gap-3 text-slate-400">
              <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" aria-label={t("footer.ariaFacebook")} className="hover:text-white">
                <Share2 className="h-4 w-4" />
              </a>
              <a href={SOCIAL_LINKS.twitter} target="_blank" rel="noopener noreferrer" aria-label={t("footer.ariaTwitter")} className="hover:text-white">
                <Globe className="h-4 w-4" />
              </a>
              <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" aria-label={t("footer.ariaInstagram")} className="hover:text-white">
                <Share2 className="h-4 w-4" />
              </a>
              <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" aria-label={t("footer.ariaLinkedIn")} className="hover:text-white">
                <Globe className="h-4 w-4" />
              </a>
            </div>
          </div>

          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="text-white font-semibold mb-4 text-sm">{c.title}</h4>
              <ul className="space-y-2">
                {c.links.map((l) => (
                  <li key={l.to + l.label}>
                    <Link to={l.to as any} className="text-sm text-slate-400 hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 grid md:grid-cols-2 gap-6 items-center">
          <div>
            <h4 className="text-white font-semibold mb-2">{t("footer.newsletterTitle")}</h4>
            <p className="text-sm text-slate-400">{t("footer.newsletterDesc")}</p>
          </div>
          <form className="flex flex-col gap-2 sm:flex-row" onSubmit={onSubscribe}>
            <div className="relative min-w-0 flex-1">
              <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("footer.emailPlaceholder")}
                required
                className="ps-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
              />
            </div>
            <Button type="submit" size="default" variant="gradient" className="shrink-0 sm:w-auto" disabled={subscribing}>
              {subscribing ? t("footer.subscribing", "Subscribing…") : t("footer.subscribe")}
            </Button>
          </form>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between text-xs text-slate-500">
          <p>{t("footer.copyright")}</p>
          <div className="flex flex-wrap justify-center md:justify-end gap-x-4 gap-y-2">
            <Link to="/privacy" className="hover:text-white transition-colors">
              {t("footer.privacy")}
            </Link>
            <Link to="/terms" className="hover:text-white transition-colors">
              {t("footer.terms")}
            </Link>
            <Link to="/refund" className="hover:text-white transition-colors">
              {t("footer.refund")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
