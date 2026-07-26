"use client";

import { Link, useNavigate, useParams } from "@/lib/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
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
import { afterAuthPath } from "@/lib/auth-redirect";
import { RatingStars } from "@/components/lms/RatingStars";
import { formatApiErrorMessage } from "@/lib/api";
import { useCurrency } from "@/hooks/use-currency";
import { formatTeachingSubjectLabel } from "@/lib/teaching-subjects";
import { requestTutorPhone } from "@/services/tutor-actions-api";
import { completeRazorpayCheckout } from "@/lib/razorpay";
import { toRazorpayPaise } from "@/services/razorpay-api";
import { TimelineList } from "@/components/teacher/TimelineList";
import { AppImage } from "@/components/AppImage";
import { tutorImage } from "@/data/images";
import type { Tutor } from "@/types/catalog";

import { toast } from "sonner";

function formatLastActive(t: TFunction, iso?: string | null) {
  if (!iso) return t("tutorDetail.recentlyActive", "Recently active");
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return t("tutorDetail.activeNow", "Active now");
  if (mins < 60) {
    return mins === 1
      ? t("tutorDetail.lastLoginMinsOne", "Last login: {{count}} min ago", { count: mins })
      : t("tutorDetail.lastLoginMins", "Last login: {{count}} mins ago", { count: mins });
  }
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) {
    return hrs === 1
      ? t("tutorDetail.lastLoginHoursOne", "Last login: {{count}} hour ago", { count: hrs })
      : t("tutorDetail.lastLoginHours", "Last login: {{count}} hours ago", { count: hrs });
  }
  const days = Math.floor(hrs / 24);
  return days === 1
    ? t("tutorDetail.lastLoginDaysOne", "Last login: {{count}} day ago", { count: days })
    : t("tutorDetail.lastLoginDays", "Last login: {{count}} days ago", { count: days });
}

function subjectHeadline(tutor: Tutor) {
  const list = tutor.subjects?.length ? tutor.subjects : [tutor.subject];
  return list.join(", ");
}

function displaySubjects(tutor: Tutor) {
  if (tutor.teachingSubjects?.length) {
    return tutor.teachingSubjects.map((entry) => formatTeachingSubjectLabel(entry));
  }
  if (tutor.subjects?.length) return tutor.subjects;
  return [tutor.subject];
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
  const { t } = useTranslation("common");
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useApp();
  const { formatLocalizedPrice, currency: visitorCurrency } = useCurrency();
  const { data: tutor, isLoading, error } = useTutor(id);
  const { reviews, summary } = useTutorReviews(id);
  const { data: relatedResult } = useTutorSearch(
    { subject: tutor?.subject, sortBy: "rating" },
    1,
    8,
    !!tutor?.subject,
  );
  const related = (relatedResult?.tutors ?? []).filter((x) => x.id !== id).slice(0, 4);

  const [payOpen, setPayOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [payLoading, setPayLoading] = useState(false);

  const requireStudent = (action: () => void) => {
    if (!user) {
      toast.info(t("tutorDetail.toastSignIn", "Please sign in as a student or parent to continue."));
      void navigate({ to: "/login", search: { redirect: `/tutors/${id}` } });
      return;
    }
    if (user.role !== "student" && user.role !== "parent") {
      toast.info(t("tutorDetail.toastStudentsOnly", "Only students and parents can contact tutors from this page."));
      return;
    }
    if (!user.profileComplete) {
      toast.info(t("tutorDetail.toastCompleteProfile", "Complete your profile registration before contacting tutors."));
      void navigate({
        to: afterAuthPath(user.role, false, user.isVerified !== false),
      });
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
          toast.success(t("tutorDetail.toastPhoneSent", "Phone number sent to {{email}}", { email: result.deliveredTo }));
        } else {
          toast.warning(
            t(
              "tutorDetail.toastPhoneEmailFailed",
              "Email could not be sent — ask an admin to configure SMTP. The tutor may not have a phone on file.",
            ),
          );
        }
      } catch (e) {
        toast.error(formatApiErrorMessage(e, t("tutorDetail.toastPhoneFailed", "Could not send phone number")));
      } finally {
        setPhoneLoading(false);
      }
    });
  };

  const handlePay = () => {
    requireStudent(() => setPayOpen(true));
  };

  const confirmPay = async () => {
    if (!tutor || !user) return;
    setPayLoading(true);
    try {
      const currency = tutor.currency || "INR";
      const amountPaise = toRazorpayPaise(tutor.price, currency);
      const result = await completeRazorpayCheckout({
        amount: amountPaise,
        currency: "INR",
        type: "tutor_session",
        referenceId: tutor.id,
        description: t("tutorDetail.paymentDescription", "Tutor session with {{name}}", { name: tutor.name }),
        customerName: user.name,
        customerEmail: user.email,
        customerPhone: user.phone ? `${user.phoneCountryCode || ""}${user.phone}` : undefined,
        metadata: { tutorName: tutor.name, displayCurrency: currency, displayPrice: tutor.price },
      });
      setPayOpen(false);
      toast.success(t("tutorDetail.toastPaymentSuccess", "Payment successful — invoice {{id}}", { id: result.invoiceId }));
    } catch (e) {
      const message = e instanceof Error ? e.message : t("tutorDetail.paymentFailed", "Payment failed");
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

  if (error || !tutor) {
    return (
      <div className="container mx-auto p-12 text-center">
        <h1 className="font-display font-bold">{t("tutorDetail.notFound", "Tutor not found")}</h1>
        <Button asChild className="mt-4">
          <Link to="/tutors">{t("tutorDetail.browseTutors", "Browse tutors")}</Link>
        </Button>
      </div>
    );
  }

  const img = tutor.avatarUrl || tutor.image || tutorImage(tutor.id);
  const subjects = displaySubjects(tutor);
  const localizedHourly = formatLocalizedPrice(tutor.price, tutor.currency);
  const showStoredCurrency =
    tutor.currency && tutor.currency.toUpperCase() !== visitorCurrency.toUpperCase();
  const ratingValue = summary.count ? summary.rating : tutor.rating;
  const reviewCount = summary.count || tutor.reviews;
  const genderLabel =
    tutor.gender === "female"
      ? t("tutorDetail.female", "Female")
      : tutor.gender === "male"
        ? t("tutorDetail.male", "Male")
        : t("tutorDetail.other", "Other");

  return (
    <section className="bg-muted/20 pb-16">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2 text-muted-foreground">
          <Link to="/tutors">
            <ChevronLeft className="mr-1 h-4 w-4" />
            {t("tutorDetail.backToTutors", "Back to tutors")}
          </Link>
        </Button>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* Main column */}
          <div className="min-w-0 rounded-2xl border bg-card px-6 shadow-sm md:px-8">
            <header className="border-b py-6">
              <div className="flex flex-wrap items-start gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border shadow-sm md:h-24 md:w-24">
                  <AppImage
                    src={img}
                    alt={tutor.name}
                    fill
                    sizes="96px"
                    priority
                    className="object-top"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="font-display text-2xl font-extrabold leading-tight md:text-3xl">
                    {tutor.name}
                    <span className="font-normal text-muted-foreground">
                      {" "}
                      · {subjectHeadline(tutor)}
                    </span>
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {tutor.verified && (
                      <Badge className="bg-sky text-sky-foreground">
                        <ShieldCheck className="mr-1 h-3 w-3" />
                        {t("search.chipVerified")}
                      </Badge>
                    )}
                    {tutor.topTen && (
                      <Badge className="bg-amber-400 text-amber-950">
                        <Crown className="mr-1 h-3 w-3" />
                        {t("tutorDetail.topTen", "Top 10%")}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    {reviewCount > 0 ? (
                      <>
                        <RatingStars value={ratingValue} size={4} />
                        <span className="font-semibold">{ratingValue.toFixed(1)}</span>
                        <span className="text-muted-foreground">{t("tutorDetail.reviewsCount", "({{count}} reviews)", { count: reviewCount })}</span>
                      </>
                    ) : (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Star className="h-4 w-4" />
                        {t("tutorDetail.noReviewsYet", "No reviews yet")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </header>

            <SectionBlock icon={User} title={t("tutorDetail.bio", "Bio")}>
              {tutor.bio?.trim() ? (
                <div className="rounded-xl border bg-muted/30 px-4 py-4">
                  <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground/90">
                    {tutor.bio}
                  </p>
                </div>
              ) : (
                <p className="rounded-xl border border-dashed bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
                  {t("tutorDetail.noBio", "This tutor has not added a bio yet.")}
                </p>
              )}
            </SectionBlock>

            <SectionBlock icon={BookOpen} title={t("tutorDetail.subjects", "Subjects")}>
              <ul className="space-y-2">
                {subjects.map((label) => (
                  <li key={label} className="flex items-center gap-2 text-sm">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
                    {label}
                  </li>
                ))}
              </ul>
            </SectionBlock>

            <SectionBlock icon={Briefcase} title={t("tutorDetail.experience", "Experience")}>
              {tutor.experienceEntries?.length ? (
                <TimelineList
                  icon="experience"
                  emptyMessage=""
                  items={tutor.experienceEntries.map((entry) => ({
                    id: entry.id,
                    title: entry.title,
                    subtitle: entry.organization,
                    startDate: entry.startDate,
                    endDate: entry.endDate,
                    description: entry.description,
                  }))}
                />
              ) : tutor.experience > 0 ? (
                <p className="text-sm text-foreground/85">
                  <strong className="text-foreground">{t("tutorDetail.experienceYears", "{{count}} years", { count: tutor.experience })}</strong>{" "}
                  {t("tutorDetail.teachingExperienceSuffix", "of teaching experience")}
                  {tutor.speciality ? ` · ${tutor.speciality}` : ""}.
                </p>
              ) : (
                <p className="rounded-lg border border-dashed bg-muted/20 px-4 py-5 text-sm text-muted-foreground">
                  {t("tutorDetail.noExperience", "No experience details added yet.")}
                </p>
              )}
            </SectionBlock>

            <SectionBlock icon={GraduationCap} title={t("tutorDetail.education", "Education")}>
              {(tutor.education ?? []).length > 0 ? (
                <TimelineList
                  icon="education"
                  emptyMessage=""
                  items={(tutor.education ?? []).map((entry) => ({
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
                  {t("tutorDetail.noEducation", "No education details added yet.")}
                </p>
              )}
            </SectionBlock>

            {tutor.teachingStyle?.trim() && (
              <SectionBlock icon={BookOpen} title={t("tutorDetail.teachingStyle", "Teaching style")}>
                <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground/90">
                  {tutor.teachingStyle}
                </p>
              </SectionBlock>
            )}

            <SectionBlock icon={DollarSign} title={t("tutorDetail.feeDetails", "Fee details")}>
              <div className="space-y-2 rounded-xl border bg-muted/20 px-4 py-4 text-sm text-foreground/85">
                <p>
                  <strong className="text-foreground">
                    {t("tutorDetail.pricePerHour", "{{price}}/hour", { price: localizedHourly })}
                  </strong>
                  {showStoredCurrency ? ` ${t("tutorDetail.listedIn", "(listed in {{currency}})", { currency: tutor.currency })}` : ""}
                </p>
                {tutor.availability && (
                  <p>
                    {t("tutorDetail.availabilityLabel", "Availability:")} <span className="text-foreground">{tutor.availability}</span>
                  </p>
                )}
                {tutor.online && (
                  <p className="text-emerald-600 dark:text-emerald-400">{t("tutorDetail.freeDemoNote", "Free demo class may be available — message the tutor to ask.")}</p>
                )}
              </div>
            </SectionBlock>

            <SectionBlock icon={MessageSquare} title={t("footer.reviews")}>
              {reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("tutorDetail.noReviewsPrompt", "No reviews yet. Be the first one to")}{" "}
                  <button
                    type="button"
                    onClick={handleReview}
                    className="font-semibold text-primary hover:underline"
                  >
                    {t("tutorDetail.reviewThisTutor", "review this tutor")}
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
                  label={t("tutorDetail.actionMessage", "Message")}
                  icon={Mail}
                  className="bg-emerald-500 hover:bg-emerald-600"
                  onClick={handleMessage}
                />
                <ActionButton
                  label={t("tutorDetail.actionPhone", "Phone")}
                  icon={Phone}
                  className="bg-sky-500 hover:bg-sky-600"
                  onClick={handlePhone}
                  loading={phoneLoading}
                />
                <ActionButton
                  label={t("tutorDetail.actionTrial", "Trial")}
                  icon={Clock}
                  className="bg-teal-500 hover:bg-teal-600"
                  onClick={handlePay}
                />
                <ActionButton
                  label={t("tutorDetail.actionHire", "Hire")}
                  icon={CreditCard}
                  className="bg-violet-500 hover:bg-violet-600"
                  onClick={handlePay}
                />
                <ActionButton
                  label={t("tutorDetail.actionReview", "Review")}
                  icon={Star}
                  className="bg-amber-500 hover:bg-amber-600"
                  onClick={handleReview}
                />
              </div>

              <div className="divide-y">
                <SidebarRow icon={MapPin} label={t("search.locationLabel")} value={tutor.publicLocation || tutor.location || t("tutorDetail.notSpecified", "Not specified")} />
                <SidebarRow
                  icon={Briefcase}
                  label={t("tutorDetail.experience", "Experience")}
                  value={t("tutorDetail.yearsShort", "{{count}} yrs", { count: tutor.yearsOfExperience ?? tutor.experience })}
                />
                <SidebarRow
                  icon={Wifi}
                  label={t("tutorDetail.teachingMode", "Teaching mode")}
                  value={[
                    tutor.onlineTeaching || tutor.online ? t("search.modeOnline") : null,
                    tutor.homeTuition ? t("search.homeTuition") : null,
                    tutor.groupClasses ? t("tutorDetail.groupClasses", "Group classes") : null,
                    tutor.assignmentHelp ? t("postReq.assignmentHelp") : null,
                  ]
                    .filter(Boolean)
                    .join(" · ") || t("tutorDetail.notSpecified", "Not specified")}
                />
                <SidebarRow
                  icon={Wifi}
                  label={t("tutorDetail.onlineTeaching", "Online teaching")}
                  value={tutor.onlineTeaching || tutor.online ? t("tutorDetail.yes", "Yes") : t("tutorDetail.no", "No")}
                />
                <SidebarRow icon={MapPin} label={t("search.homeTuition")} value={tutor.homeTuition ? t("tutorDetail.yes", "Yes") : t("tutorDetail.no", "No")} />
                <SidebarRow icon={BookOpen} label={t("postReq.assignmentHelp")} value={tutor.assignmentHelp ? t("tutorDetail.yes", "Yes") : t("tutorDetail.no", "No")} />
                <SidebarRow icon={User} label={t("tutorDetail.gender", "Gender")} value={genderLabel} />
                <SidebarRow icon={Clock} label={t("tutorDetail.activity", "Activity")} value={formatLastActive(t, tutor.lastLoginAt)} />
                <SidebarRow
                  icon={Languages}
                  label={t("tutorDetail.speaks", "Speaks")}
                  value={tutor.language.length ? tutor.language.join(", ") : t("tutorDetail.notSpecified", "Not specified")}
                />
                <SidebarRow icon={Clock} label={t("tutorDetail.availability", "Availability")} value={tutor.availability || t("tutorDetail.notSpecified", "Not specified")} />
              </div>

              <div className="border-t bg-muted/20 p-4">
                <div className="font-display text-2xl font-extrabold">
                  {localizedHourly}
                  <span className="text-sm font-normal text-muted-foreground">{t("tutorDetail.perHour", "/hour")}</span>
                </div>
                <Button size="lg" variant="gradient" className="mt-3 w-full" onClick={handlePay}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  {t("tutorDetail.bookTrial", "Book trial session")}
                </Button>
              </div>
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-6 font-display text-xl font-bold">{t("tutorDetail.moreSubjectTutors", "More {{subject}} tutors", { subject: tutor.subject })}</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((r) => (
                <TutorCard key={r.id} tutor={r} />
              ))}
            </div>
          </div>
        )}
      </div>

      <TutorPayDialog
        tutor={tutor}
        open={payOpen}
        onOpenChange={setPayOpen}
        paying={payLoading}
        onConfirm={confirmPay}
      />
      <TutorReviewDialog
        tutorId={id}
        tutorName={tutor.name}
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
  const { t } = useTranslation("common");
  const display = value?.trim() || t("tutorDetail.notSpecified", "Not specified");
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
