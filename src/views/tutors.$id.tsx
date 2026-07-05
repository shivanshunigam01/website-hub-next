"use client";

import { Link, useNavigate, useParams } from "@/lib/navigation";
import { useState } from "react";
import {
  Star,
  MapPin,
  ShieldCheck,
  Crown,
  Wifi,
  Mail,
  Phone,
  CreditCard,
  Languages,
  Loader2,
  Briefcase,
  GraduationCap,
  BookOpen,
  DollarSign,
  MessageSquare,
  User,
  Clock,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TutorCard } from "@/components/cards/TutorCard";
import { TutorPayDialog } from "@/components/tutors/TutorPayDialog";
import { TutorReviewDialog } from "@/components/tutors/TutorReviewDialog";
import { useTutor } from "@/hooks/use-catalog";
import { useTutorSearch } from "@/hooks/use-tutor-search";
import { useTutorReviews } from "@/hooks/use-learning";
import { useApp } from "@/hooks/use-app";
import { RatingStars } from "@/components/lms/RatingStars";
import { formatApiErrorMessage } from "@/lib/api";
import { useCurrency } from "@/hooks/use-currency";
import { formatTeachingSubjectLabel } from "@/lib/teaching-subjects";
import { requestTutorPhone } from "@/services/tutor-actions-api";
import { completeRazorpayCheckout } from "@/lib/razorpay";
import { toRazorpayPaise } from "@/services/razorpay-api";
import { TimelineList } from "@/components/teacher/TimelineList";
import { tutorImage } from "@/data/images";
import type { Tutor } from "@/types/catalog";

import { toast } from "sonner";

function formatLastActive(iso?: string | null) {
  if (!iso) return "Recently active";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Active now";
  if (mins < 60) return `Last login: ${mins} min${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Last login: ${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.floor(hrs / 24);
  return `Last login: ${days} day${days === 1 ? "" : "s"} ago`;
}

function subjectHeadline(t: Tutor) {
  const list = t.subjects?.length ? t.subjects : [t.subject];
  return list.join(", ");
}

function displaySubjects(t: Tutor) {
  if (t.teachingSubjects?.length) {
    return t.teachingSubjects.map((entry) => formatTeachingSubjectLabel(entry));
  }
  if (t.subjects?.length) return t.subjects;
  return [t.subject];
}

function SectionBlock({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b py-6 last:border-b-0">
      <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-primary">
        <Icon className="h-5 w-5" />
        {title}
      </h2>
      {children}
    </section>
  );
}

function TutorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useApp();
  const { formatLocalizedPrice, currency: visitorCurrency } = useCurrency();
  const { data: t, isLoading, error } = useTutor(id);
  const { reviews, summary } = useTutorReviews(id);
  const { data: relatedResult } = useTutorSearch(
    { subject: t?.subject, sortBy: "rating" },
    1,
    8,
    !!t?.subject,
  );
  const related = (relatedResult?.tutors ?? []).filter((x) => x.id !== id).slice(0, 4);

  const [payOpen, setPayOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [payLoading, setPayLoading] = useState(false);

  const requireStudent = (action: () => void) => {
    if (!user) {
      toast.info("Please sign in as a student to continue.");
      void navigate({ to: "/login", search: { redirect: `/tutors/${id}` } });
      return;
    }
    if (user.role !== "student" && user.role !== "parent") {
      toast.info("Only students can contact tutors from this page.");
      return;
    }
    action();
  };

  const handleMessage = () => {
    requireStudent(() => {
      void navigate({ to: "/messages", search: { tutorId: id } });
    });
  };

  const handlePhone = () => {
    requireStudent(async () => {
      setPhoneLoading(true);
      try {
        const result = await requestTutorPhone(id);
        if (result.sent) {
          toast.success(`Phone number sent to ${result.deliveredTo}`);
        } else {
          toast.warning(
            "Email could not be sent — ask an admin to configure SMTP. The tutor may not have a phone on file.",
          );
        }
      } catch (e) {
        toast.error(formatApiErrorMessage(e, "Could not send phone number"));
      } finally {
        setPhoneLoading(false);
      }
    });
  };

  const handlePay = () => {
    requireStudent(() => setPayOpen(true));
  };

  const confirmPay = async () => {
    if (!t || !user) return;
    setPayLoading(true);
    try {
      const currency = t.currency || "INR";
      const amountPaise = toRazorpayPaise(t.price, currency);
      const result = await completeRazorpayCheckout({
        amount: amountPaise,
        currency: "INR",
        type: "tutor_session",
        referenceId: t.id,
        description: `Tutor session with ${t.name}`,
        customerName: user.name,
        customerEmail: user.email,
        customerPhone: user.phone ? `${user.phoneCountryCode || ""}${user.phone}` : undefined,
        metadata: { tutorName: t.name, displayCurrency: currency, displayPrice: t.price },
      });
      setPayOpen(false);
      toast.success(`Payment successful — invoice ${result.invoiceId}`);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Payment failed";
      if (message !== "Payment cancelled") {
        toast.error(formatApiErrorMessage(e, message));
      }
    } finally {
      setPayLoading(false);
    }
  };

  const handleReview = () => {
    requireStudent(() => setReviewOpen(true));
  };

  if (isLoading) {
    return (
      <div className="container flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !t) {
    return (
      <div className="container mx-auto p-12 text-center">
        <h1 className="font-display font-bold">Tutor not found</h1>
        <Button asChild className="mt-4">
          <Link to="/tutors">Browse tutors</Link>
        </Button>
      </div>
    );
  }

  const img = t.avatarUrl || t.image || tutorImage(t.id);
  const subjects = displaySubjects(t);
  const localizedHourly = formatLocalizedPrice(t.price, t.currency);
  const showStoredCurrency =
    t.currency && t.currency.toUpperCase() !== visitorCurrency.toUpperCase();
  const ratingValue = summary.count ? summary.rating : t.rating;
  const reviewCount = summary.count || t.reviews;
  const genderLabel =
    t.gender === "female" ? "Female" : t.gender === "male" ? "Male" : "Other";

  return (
    <section className="bg-muted/20 pb-16">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2 text-muted-foreground">
          <Link to="/tutors">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to tutors
          </Link>
        </Button>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* Main column */}
          <div className="min-w-0 rounded-2xl border bg-card px-6 shadow-sm md:px-8">
            <header className="border-b py-6">
              <div className="flex flex-wrap items-start gap-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border shadow-sm md:h-24 md:w-24">
                  <img src={img} alt={t.name} className="h-full w-full object-cover object-top" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="font-display text-2xl font-extrabold leading-tight md:text-3xl">
                    {t.name}
                    <span className="font-normal text-muted-foreground">
                      {" "}
                      · {subjectHeadline(t)}
                    </span>
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {t.verified && (
                      <Badge className="bg-sky text-sky-foreground">
                        <ShieldCheck className="mr-1 h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                    {t.topTen && (
                      <Badge className="bg-amber-400 text-amber-950">
                        <Crown className="mr-1 h-3 w-3" />
                        Top 10%
                      </Badge>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    {reviewCount > 0 ? (
                      <>
                        <RatingStars value={ratingValue} size={4} />
                        <span className="font-semibold">{ratingValue.toFixed(1)}</span>
                        <span className="text-muted-foreground">({reviewCount} reviews)</span>
                      </>
                    ) : (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Star className="h-4 w-4" />
                        No reviews yet
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </header>

            <SectionBlock icon={User} title="Bio">
              {t.bio?.trim() ? (
                <div className="rounded-xl border bg-muted/30 px-4 py-4">
                  <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground/90">
                    {t.bio}
                  </p>
                </div>
              ) : (
                <p className="rounded-xl border border-dashed bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
                  This tutor has not added a bio yet.
                </p>
              )}
            </SectionBlock>

            <SectionBlock icon={BookOpen} title="Subjects">
              <ul className="space-y-2">
                {subjects.map((label) => (
                  <li key={label} className="flex items-center gap-2 text-sm">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
                    {label}
                  </li>
                ))}
              </ul>
            </SectionBlock>

            <SectionBlock icon={Briefcase} title="Experience">
              {t.experienceEntries?.length ? (
                <TimelineList
                  icon="experience"
                  emptyMessage=""
                  items={t.experienceEntries.map((entry) => ({
                    id: entry.id,
                    title: entry.title,
                    subtitle: entry.organization,
                    startDate: entry.startDate,
                    endDate: entry.endDate,
                    description: entry.description,
                  }))}
                />
              ) : t.experience > 0 ? (
                <p className="text-sm text-foreground/85">
                  <strong className="text-foreground">{t.experience} years</strong> of teaching
                  experience
                  {t.speciality ? ` · ${t.speciality}` : ""}.
                </p>
              ) : (
                <p className="rounded-lg border border-dashed bg-muted/20 px-4 py-5 text-sm text-muted-foreground">
                  No experience details added yet.
                </p>
              )}
            </SectionBlock>

            <SectionBlock icon={GraduationCap} title="Education">
              {(t.education ?? []).length > 0 ? (
                <TimelineList
                  icon="education"
                  emptyMessage=""
                  items={(t.education ?? []).map((entry) => ({
                    id: entry.id,
                    title: entry.degree,
                    subtitle: entry.institute,
                    startDate: entry.startDate,
                    endDate: entry.endDate,
                    description: entry.description,
                  }))}
                />
              ) : (
                <p className="rounded-lg border border-dashed bg-muted/20 px-4 py-5 text-sm text-muted-foreground">
                  No education details added yet.
                </p>
              )}
            </SectionBlock>

            {t.teachingStyle?.trim() && (
              <SectionBlock icon={BookOpen} title="Teaching style">
                <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground/90">
                  {t.teachingStyle}
                </p>
              </SectionBlock>
            )}

            <SectionBlock icon={DollarSign} title="Fee details">
              <div className="space-y-2 rounded-xl border bg-muted/20 px-4 py-4 text-sm text-foreground/85">
                <p>
                  <strong className="text-foreground">
                    {localizedHourly}/hour
                  </strong>
                  {showStoredCurrency ? ` (listed in ${t.currency})` : ""}
                </p>
                {t.availability && (
                  <p>
                    Availability: <span className="text-foreground">{t.availability}</span>
                  </p>
                )}
                {t.online && (
                  <p className="text-emerald-600 dark:text-emerald-400">Free demo class may be available — message the tutor to ask.</p>
                )}
              </div>
            </SectionBlock>

            <SectionBlock icon={MessageSquare} title="Reviews">
              {reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No reviews yet. Be the first one to{" "}
                  <button
                    type="button"
                    onClick={handleReview}
                    className="font-semibold text-primary hover:underline"
                  >
                    review this tutor
                  </button>
                  .
                </p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div key={r.id} className="rounded-xl border bg-muted/20 p-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-primary text-sm font-bold text-white">
                          {r.studentName[0]}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold">{r.studentName}</div>
                          <RatingStars value={r.rating} size={3} />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </SectionBlock>
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
              <div className="flex border-b">
                <ActionButton
                  label="Message"
                  icon={Mail}
                  className="bg-emerald-500 hover:bg-emerald-600"
                  onClick={handleMessage}
                />
                <ActionButton
                  label="Phone"
                  icon={Phone}
                  className="bg-sky-500 hover:bg-sky-600"
                  onClick={handlePhone}
                  loading={phoneLoading}
                />
                <ActionButton
                  label="Trial"
                  icon={Clock}
                  className="bg-teal-500 hover:bg-teal-600"
                  onClick={handlePay}
                />
                <ActionButton
                  label="Hire"
                  icon={CreditCard}
                  className="bg-violet-500 hover:bg-violet-600"
                  onClick={handlePay}
                />
                <ActionButton
                  label="Review"
                  icon={Star}
                  className="bg-amber-500 hover:bg-amber-600"
                  onClick={handleReview}
                />
              </div>

              <div className="divide-y">
                <SidebarRow icon={MapPin} label="Location" value={t.publicLocation || t.location || "Not specified"} />
                <SidebarRow
                  icon={Briefcase}
                  label="Experience"
                  value={`${t.yearsOfExperience ?? t.experience} yrs`}
                />
                <SidebarRow
                  icon={Wifi}
                  label="Teaching mode"
                  value={[
                    t.onlineTeaching || t.online ? "Online" : null,
                    t.homeTuition ? "Home tuition" : null,
                    t.groupClasses ? "Group classes" : null,
                    t.assignmentHelp ? "Assignment help" : null,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "Not specified"}
                />
                <SidebarRow
                  icon={Wifi}
                  label="Online teaching"
                  value={t.onlineTeaching || t.online ? "Yes" : "No"}
                />
                <SidebarRow icon={MapPin} label="Home tuition" value={t.homeTuition ? "Yes" : "No"} />
                <SidebarRow icon={BookOpen} label="Assignment help" value={t.assignmentHelp ? "Yes" : "No"} />
                <SidebarRow icon={User} label="Gender" value={genderLabel} />
                <SidebarRow icon={Clock} label="Activity" value={formatLastActive(t.lastLoginAt)} />
                <SidebarRow
                  icon={Languages}
                  label="Speaks"
                  value={t.language.length ? t.language.join(", ") : "Not specified"}
                />
                <SidebarRow icon={Clock} label="Availability" value={t.availability || "Not specified"} />
              </div>

              <div className="border-t bg-muted/20 p-4">
                <div className="font-display text-2xl font-extrabold">
                  {localizedHourly}
                  <span className="text-sm font-normal text-muted-foreground">/hour</span>
                </div>
                <Button size="lg" variant="gradient" className="mt-3 w-full" onClick={handlePay}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Book trial session
                </Button>
              </div>
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-6 font-display text-xl font-bold">More {t.subject} tutors</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((r) => (
                <TutorCard key={r.id} tutor={r} />
              ))}
            </div>
          </div>
        )}
      </div>

      <TutorPayDialog
        tutor={t}
        open={payOpen}
        onOpenChange={setPayOpen}
        paying={payLoading}
        onConfirm={confirmPay}
      />
      <TutorReviewDialog
        tutorId={id}
        tutorName={t.name}
        open={reviewOpen}
        onOpenChange={setReviewOpen}
      />
    </section>
  );
}

function ActionButton({
  label,
  icon: Icon,
  className,
  onClick,
  loading,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  className: string;
  onClick: () => void;
  loading?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1.5 border-e border-white/15 px-1 py-3.5 text-white transition-colors last:border-e-0 disabled:opacity-70 sm:py-4 ${className}`}
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Icon className="h-5 w-5 shrink-0" />
      )}
      <span className="text-[10px] font-semibold leading-none sm:text-[11px]">{label}</span>
    </button>
  );
}

function SidebarRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string | null;
}) {
  const display = value?.trim() || "Not specified";
  return (
    <div className="flex gap-3 px-4 py-3.5 text-sm">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
      <div className="min-w-0 flex-1">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="mt-0.5 font-medium leading-snug text-foreground">{display}</div>
      </div>
    </div>
  );
}

export default TutorDetail;
