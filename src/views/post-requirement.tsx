"use client";

import { Link, useNavigate } from "@/lib/navigation";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  LogIn,
  MessageCircle,
  Paperclip,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/hooks/use-app";
import { useCreateRequirement, useMyRequirements } from "@/hooks/use-requirements-api";
import { useCurrency } from "@/hooks/use-currency";
import { apiUpload, formatApiErrorMessage } from "@/lib/api";
import { afterAuthPath } from "@/lib/auth-redirect";
import { requirementStatusClass, requirementStatusLabel } from "@/lib/tutor-jobs-utils";
import { TutorPageBannerBackground } from "@/components/tutors/TutorPageBannerBackground";
import { SubjectAutocomplete } from "@/components/tutors/SubjectAutocomplete";
import { AddressAutocomplete } from "@/components/forms/AddressAutocomplete";
import { StudentConfirmDialog } from "@/components/forms/StudentConfirmDialog";
import { RequirementVerifyDialog } from "@/components/forms/RequirementVerifyDialog";
import { LanguageMultiSelect } from "@/components/forms/LanguageMultiSelect";
import { PhoneNumberField } from "@/components/PhoneNumberField";
import { ensureSubject } from "@/services/subjects-api";
import {
  BUDGET_UNIT_OPTIONS,
  DETAILS_EXAMPLE,
  LEVEL_OPTIONS,
  TEACHER_GENDER_OPTIONS,
  TIME_COMMITMENT_OPTIONS,
  TUTOR_ORIGIN_OPTIONS,
} from "@/data/requirement-form";
import { countWords, validateRequirementDetails } from "@/lib/requirement-details";
import { normalizeSubjectName } from "@/lib/subject-name";
import { cn } from "@/lib/utils";
import type { AddressSuggestion } from "@/app/api/geolocation/autocomplete/route";
import type { CreateRequirementPayload } from "@/types/requirement";

const QUICK_TITLE_KEYS = [
  "postReq.quick1",
  "postReq.quick2",
  "postReq.quick3",
  "postReq.quick4",
] as const;

const QUICK_TITLE_DEFAULTS = [
  "Class 10 Math tutor for board exams",
  "IELTS speaking practice",
  "Python for beginners",
  "NEET Biology crash course",
] as const;

const STEP_KEYS = [
  { titleKey: "postReq.step1.title", descKey: "postReq.step1.desc", icon: FileText },
  { titleKey: "postReq.step2.title", descKey: "postReq.step2.desc", icon: Calendar },
  { titleKey: "postReq.step3.title", descKey: "postReq.step3.desc", icon: MessageCircle },
] as const;

const PERK_KEYS = [
  { icon: ShieldCheck, key: "postReq.perk1" },
  { icon: Clock, key: "postReq.perk2" },
  { icon: Users, key: "postReq.perk3" },
  { icon: Sparkles, key: "postReq.perk4" },
] as const;

type Attachment = { url: string; name: string; mimeType?: string; size?: number };

type MeetingOptions = {
  online: boolean;
  atMyPlace: boolean;
  travelToTutor: boolean;
};

type FormState = {
  title: string;
  locationQuery: string;
  locationSelected: boolean;
  addressFormatted: string;
  city: string;
  country: string;
  placeId: string;
  locationLat?: number;
  locationLng?: number;
  phoneCountryCode: string;
  phone: string;
  details: string;
  subject: string;
  subjectPendingApproval: boolean;
  level: string;
  levelOther: string;
  jobType: "tutoring" | "assignment";
  meetingOptions: MeetingOptions;
  budget: string;
  budgetUnit: CreateRequirementPayload["budgetUnit"];
  teacherGender: NonNullable<CreateRequirementPayload["teacherGender"]>;
  timeCommitment: NonNullable<CreateRequirementPayload["timeCommitment"]>;
  languages: string[];
  tutorOrigin: string;
  attachments: Attachment[];
  acceptedTerms: boolean;
};

function buildInitialForm(phoneCountryCode = "+91", phone = ""): FormState {
  return {
    title: "",
    locationQuery: "",
    locationSelected: false,
    addressFormatted: "",
    city: "",
    country: "",
    placeId: "",
    locationLat: undefined,
    locationLng: undefined,
    phoneCountryCode,
    phone,
    details: "",
    subject: "",
    subjectPendingApproval: false,
    level: "high",
    levelOther: "",
    jobType: "tutoring",
    meetingOptions: { online: true, atMyPlace: false, travelToTutor: false },
    budget: "30",
    budgetUnit: "hour",
    teacherGender: "any",
    timeCommitment: "part-time",
    languages: ["English"],
    tutorOrigin: "",
    attachments: [],
    acceptedTerms: false,
  };
}

function deriveMode(mo: MeetingOptions): "online" | "offline" | "both" {
  const inPerson = mo.atMyPlace || mo.travelToTutor;
  if (mo.online && inPerson) return "both";
  if (mo.online) return "online";
  return "offline";
}

function Post() {
  const { t } = useTranslation("common");
  const { user, role, loading: authLoading, profileComplete } = useApp();
  const createMut = useCreateRequirement();
  const { data: myPosts = [], refetch: refetchMine } = useMyRequirements(
    !!user && (role === "student" || role === "parent") && profileComplete,
  );
  const { currency, symbol } = useCurrency();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FormState>(() =>
    buildInitialForm(user?.phoneCountryCode || "+91", user?.phone || ""),
  );
  const [confirmedStudent, setConfirmedStudent] = useState(false);
  const [studentDialogOpen, setStudentDialogOpen] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyEmailSent, setVerifyEmailSent] = useState(false);
  const [verifyPhone, setVerifyPhone] = useState({ countryCode: "+91", phone: "" });
  const [uploading, setUploading] = useState(false);
  const [addingSubject, setAddingSubject] = useState(false);
  const nav = useNavigate();

  const canPost = role === "student" || role === "parent";
  const detailsWords = countWords(form.details);

  const quickTitles = useMemo(
    () => QUICK_TITLE_KEYS.map((key, i) => t(key, QUICK_TITLE_DEFAULTS[i])),
    [t],
  );

  useEffect(() => {
    if (authLoading || !user || !canPost) return;
    const verified =
      user.provider === "whatsapp" || !user.email ? true : user.isVerified !== false;
    if (!verified || !profileComplete) {
      void nav({ to: afterAuthPath(role!, profileComplete, verified) });
    }
  }, [authLoading, user, canPost, profileComplete, role, nav]);

  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      phoneCountryCode: user.phoneCountryCode || prev.phoneCountryCode || "+91",
      phone: user.phone || prev.phone || "",
    }));
  }, [user]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onLocationChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      locationQuery: value,
      locationSelected: false,
      addressFormatted: "",
      city: "",
      country: "",
      placeId: "",
      locationLat: undefined,
      locationLng: undefined,
    }));
  };

  const onLocationSelect = (suggestion: AddressSuggestion) => {
    setForm((prev) => ({
      ...prev,
      locationQuery: suggestion.label,
      locationSelected: true,
      addressFormatted: suggestion.label,
      city: suggestion.city || "",
      country: suggestion.country || "",
      placeId: suggestion.id,
      locationLat: suggestion.lat,
      locationLng: suggestion.lng,
    }));
  };

  const handleAddNewSubject = async () => {
    const name = normalizeSubjectName(form.subject);
    if (!name) {
      toast.error(t("postReq.toastSubject", "Please choose a subject."));
      return;
    }
    setAddingSubject(true);
    try {
      const subject = await ensureSubject(name, { pendingApproval: true });
      setForm((prev) => ({
        ...prev,
        subject: subject.name,
        subjectPendingApproval: true,
      }));
      toast.success(t("postReq.subjectPending", "Subject added and pending approval."));
    } catch (err) {
      toast.error(formatApiErrorMessage(err, t("postReq.toastSubjectAddFailed", "Could not add subject")));
    } finally {
      setAddingSubject(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    if (form.attachments.length + files.length > 10) {
      toast.error(t("postReq.toastMaxFiles", "You can upload up to 10 files."));
      return;
    }
    setUploading(true);
    try {
      const uploaded: Attachment[] = [];
      for (const file of files) {
        const result = await apiUpload(file);
        uploaded.push({
          url: result.url,
          name: result.filename || file.name,
          mimeType: result.mimetype || file.type,
          size: result.size ?? file.size,
        });
      }
      setForm((prev) => ({ ...prev, attachments: [...prev.attachments, ...uploaded] }));
      toast.success(t("postReq.toastFilesUploaded", "File(s) uploaded."));
    } catch (err) {
      toast.error(formatApiErrorMessage(err, t("postReq.toastUploadFailed", "Could not upload file")));
    } finally {
      setUploading(false);
    }
  };

  const removeAttachment = (url: string) => {
    setForm((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((a) => a.url !== url),
    }));
  };

  const validateForm = (): boolean => {
    if (!user || !canPost) {
      toast.error(t("postReq.toastSignIn", "Please sign in as a student or parent to post a requirement."));
      return false;
    }
    if (!profileComplete) {
      toast.error(
        t("postReq.toastCompleteProfile", "Complete your profile registration before posting a requirement."),
      );
      void nav({ to: afterAuthPath(role!, false, true) });
      return false;
    }
    if (!form.subject.trim()) {
      toast.error(t("postReq.toastSubject", "Please choose a subject."));
      return false;
    }
    if (!form.locationSelected || !form.addressFormatted.trim()) {
      toast.error(
        t("postReq.toastSelectLocation", "Please select your location from the suggested options."),
      );
      return false;
    }
    const phoneDigits = form.phone.replace(/\D/g, "");
    if (!form.phoneCountryCode.trim() || phoneDigits.length < 7) {
      toast.error(t("postReq.toastPhone", "Please enter a valid phone number."));
      return false;
    }
    const detailsCheck = validateRequirementDetails(form.details);
    if (!detailsCheck.ok) {
      toast.error(detailsCheck.message || t("postReq.toastDetails", "Please fix the details field."));
      return false;
    }
    if (form.level === "other" && !form.levelOther.trim()) {
      toast.error(t("postReq.toastLevel", "Please specify the level."));
      return false;
    }
    const { online, atMyPlace, travelToTutor } = form.meetingOptions;
    if (!online && !atMyPlace && !travelToTutor) {
      toast.error(t("postReq.toastMeeting", "Select at least one meeting option."));
      return false;
    }
    if (!form.budget.trim() || Number(form.budget) < 0) {
      toast.error(t("postReq.toastBudget", "Please enter a valid budget."));
      return false;
    }
    if (!form.acceptedTerms) {
      toast.error(t("postReq.toastTerms", "Please accept the Terms and conditions."));
      return false;
    }
    return true;
  };

  const submitRequirement = async () => {
    const subject = form.subject.trim();
    const city = form.city.trim() || form.addressFormatted.trim();
    const mode = deriveMode(form.meetingOptions);
    const autoTitle =
      form.title.trim() ||
      `${mode === "offline" ? "" : "Online "}${subject} tutor needed in ${city}`.trim();

    try {
      const result = await createMut.mutateAsync({
        title: autoTitle,
        subject,
        subjectPendingApproval: form.subjectPendingApproval || undefined,
        level: form.level,
        levelOther: form.level === "other" ? form.levelOther.trim() : undefined,
        jobType: form.jobType,
        mode,
        meetingOptions: form.meetingOptions,
        location: form.addressFormatted.trim(),
        city: form.city.trim() || undefined,
        country: form.country.trim() || undefined,
        addressFormatted: form.addressFormatted.trim(),
        placeId: form.placeId || undefined,
        locationLat: form.locationLat,
        locationLng: form.locationLng,
        budgetPerHour: Number(form.budget) || 0,
        budget: Number(form.budget) || 0,
        currency,
        budgetUnit: form.budgetUnit,
        timeCommitment: form.timeCommitment,
        teacherGender: form.teacherGender,
        languages: form.languages.length ? form.languages : undefined,
        tutorOrigin: form.tutorOrigin || undefined,
        phoneCountryCode: form.phoneCountryCode.trim(),
        phone: form.phone.trim(),
        attachments: form.attachments.length ? form.attachments : undefined,
        details: form.details.trim(),
        acceptedTerms: true,
      });

      const emailSent = Boolean((result as { emailSent?: boolean })?.emailSent);
      setVerifyEmailSent(emailSent);
      setVerifyPhone({ countryCode: form.phoneCountryCode, phone: form.phone });
      setVerifyOpen(true);
      setSubmitted(true);
      setForm(buildInitialForm(user?.phoneCountryCode || "+91", user?.phone || ""));
      setConfirmedStudent(false);
      void refetchMine();
      toast.success(t("postReq.toastSubmitted", "Requirement submitted! Pending admin approval."));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      toast.error(formatApiErrorMessage(err, t("postReq.toastSubmitFailed", "Could not submit requirement")));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!confirmedStudent) {
      setStudentDialogOpen(true);
      return;
    }

    await submitRequirement();
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-full">
        <div className="relative overflow-hidden border-b">
          <TutorPageBannerBackground />
          <div className="container relative mx-auto px-4 py-16 sm:px-6 text-center">
            <div className="mx-auto max-w-lg">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-white">
                <LogIn className="h-8 w-8" />
              </div>
              <h1 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
                {t("postReq.signInTitle")}
              </h1>
              <p className="mt-4 text-base text-white/85">{t("postReq.signInSubtitle")}</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button asChild size="lg" variant="secondary">
                  <Link to="/login" search={{ redirect: "/post-requirement" }}>
                    {t("postReq.signIn")}
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                >
                  <Link to="/register">{t("postReq.createAccount")}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!canPost) {
    return (
      <div className="container mx-auto px-4 py-16 text-center sm:px-6">
        <h1 className="font-display text-2xl font-bold">{t("postReq.studentsOnlyTitle")}</h1>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">{t("postReq.studentsOnlyDesc")}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild variant="outline">
            <Link to="/tutor-jobs">{t("postReq.browseJobs")}</Link>
          </Button>
          <Button asChild>
            <Link to="/tutors">{t("postReq.findTutors")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <div className="relative overflow-hidden border-b">
        <TutorPageBannerBackground />

        <div className="container relative mx-auto px-4 py-10 sm:px-6 sm:py-12 lg:py-14">
          <div className="max-w-3xl">
            <Badge className="mb-4 border-white/25 bg-white/15 text-white hover:bg-white/15">
              <Sparkles className="me-1 h-3 w-3" />
              {t("postReq.badge")}
            </Badge>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {t("postReq.title")}
            </h1>
            <p className="mt-3 max-w-2xl text-base text-white/85 sm:text-lg">{t("postReq.subtitle")}</p>

            <div className="mt-6 flex flex-wrap gap-4 text-sm text-white/90">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                {t("postReq.trustNoCommit")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {t("postReq.trustResponse")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" />
                {t("postReq.trustVerified")}
              </span>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" variant="secondary" className="shadow-lg">
                <a href="#requirement-form">
                  {t("postReq.startPost")}
                  <ArrowRight className="ms-1 h-4 w-4" />
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                <Link to="/tutors">{t("postReq.browseInstead")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {myPosts.length > 0 && (
        <div className="container mx-auto px-4 pt-6 sm:px-6">
          <div className="rounded-2xl border bg-card p-5 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-lg font-bold">{t("postReq.yourRequirements")}</h2>
              <Button asChild variant="outline" size="sm">
                <Link to="/my-posts">{t("postReq.viewMyPosts", "View My Posts")}</Link>
              </Button>
            </div>
            <div className="space-y-3">
              {myPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex flex-wrap items-start justify-between gap-3 rounded-xl border bg-muted/20 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{post.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {post.subject} ·{" "}
                      {post.jobType === "assignment" ? t("postReq.assignmentHelp") : t("postReq.tutoring")}
                    </p>
                  </div>
                  <Badge className={requirementStatusClass(post.status)}>
                    {requirementStatusLabel(post.status)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {submitted && (
        <div className="container mx-auto px-4 pt-6 sm:px-6">
          <div className="flex items-start gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/30">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display font-bold text-emerald-900 dark:text-emerald-100">
                {t("postReq.submittedTitle")}
              </p>
              <p className="mt-1 text-sm text-emerald-800/80 dark:text-emerald-200/80">
                {t("postReq.submittedDesc")}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline" className="border-emerald-300 bg-white dark:bg-transparent">
                  <Link to="/my-posts">{t("postReq.viewMyPosts", "View My Posts")}</Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="border-emerald-300 bg-white dark:bg-transparent">
                  <Link to="/tutors">{t("postReq.browseWhileWait")}</Link>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-emerald-800 dark:text-emerald-200"
                  onClick={() => setSubmitted(false)}
                >
                  {t("postReq.postAnother")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-10 sm:px-6 md:py-14">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] lg:gap-14">
          <div className="space-y-8 lg:sticky lg:top-24">
            <div>
              <h2 className="font-display text-xl font-bold sm:text-2xl">{t("postReq.howTitle")}</h2>
              <p className="mt-1 text-sm text-muted-foreground sm:text-base">{t("postReq.howSubtitle")}</p>
              <ol className="relative mt-8 space-y-0">
                {STEP_KEYS.map((s, i) => (
                  <li key={s.titleKey} className="relative flex gap-4 pb-8 last:pb-0">
                    {i < STEP_KEYS.length - 1 && (
                      <span
                        className="absolute start-5 top-11 h-[calc(100%-2.75rem)] w-px bg-border"
                        aria-hidden
                      />
                    )}
                    <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-4 ring-background">
                      <s.icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 pt-0.5">
                      <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                        {t("postReq.stepLabel", { n: i + 1 })}
                      </span>
                      <h3 className="mt-0.5 font-display font-bold">{t(s.titleKey)}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t(s.descKey)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {PERK_KEYS.map((p) => (
                <div
                  key={p.key}
                  className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3.5 text-sm shadow-sm"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <p.icon className="h-4 w-4" />
                  </div>
                  {t(p.key)}
                </div>
              ))}
            </div>

            <blockquote className="rounded-2xl border bg-gradient-to-br from-primary/5 via-background to-fuchsia-500/5 p-6">
              <div className="flex gap-1 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-3 font-display text-lg font-bold leading-snug">
                &ldquo;{t("postReq.quote")}&rdquo;
              </p>
              <footer className="mt-3 text-sm text-muted-foreground">{t("postReq.quoteAuthor")}</footer>
            </blockquote>
          </div>

          <div id="requirement-form" className="scroll-mt-24">
            <form onSubmit={handleSubmit} className="overflow-hidden rounded-2xl border bg-card shadow-lg">
              <div className="border-b bg-muted/30 px-6 py-5 sm:px-8">
                <h2 className="font-display text-xl font-bold">{t("postReq.formTitle")}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{t("postReq.formHint")}</p>
              </div>

              <div className="space-y-5 p-6 sm:p-8">
                <div>
                  <Label htmlFor="req-title">{t("postReq.titleLabel", "Title")}</Label>
                  <Input
                    id="req-title"
                    value={form.title}
                    onChange={(e) => update("title", e.target.value)}
                    placeholder={t("postReq.titlePlaceholder", "e.g. Online Math tutor needed in Delhi")}
                    className="mt-1.5"
                  />
                  <p className="mb-2 mt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("postReq.quickExamples")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {quickTitles.map((title) => (
                      <button
                        key={title}
                        type="button"
                        onClick={() => update("title", title)}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-left text-xs transition hover:border-primary hover:text-primary",
                          form.title === title && "border-primary bg-primary/10 text-primary",
                        )}
                      >
                        {title}
                      </button>
                    ))}
                  </div>
                </div>

                <AddressAutocomplete
                  label={t("postReq.location", "Location")}
                  value={form.locationQuery}
                  onChange={onLocationChange}
                  onSelect={onLocationSelect}
                  selected={form.locationSelected}
                  required
                  placeholder={t("postReq.locationPlaceholder", "Start typing your full address…")}
                />

                <PhoneNumberField
                  id="req-phone"
                  label={t("postReq.phone", "Phone")}
                  countryCode={form.phoneCountryCode}
                  onCountryCodeChange={(code) => update("phoneCountryCode", code)}
                  phoneNumber={form.phone}
                  onPhoneNumberChange={(num) => update("phone", num)}
                  required
                  userHasSavedPhone={Boolean(user?.phone)}
                />

                <div>
                  <Label htmlFor="req-details">
                    {t("postReq.detailsLabel", "Details")} <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="req-details"
                    value={form.details}
                    onChange={(e) => update("details", e.target.value)}
                    placeholder={DETAILS_EXAMPLE}
                    className="mt-1.5 min-h-[160px] resize-y"
                  />
                  <p className="mt-1.5 text-xs font-medium text-destructive">
                    Please don&apos;t share any contact details (phone, email, website etc) here.
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-xs",
                      detailsWords < 150 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground",
                    )}
                  >
                    {t("postReq.wordCount", "{{count}} / 150 words minimum", { count: detailsWords })}
                  </p>
                </div>

                <div>
                  <Label>{t("postReq.subject", "Subjects")}</Label>
                  <SubjectAutocomplete
                    className="mt-1.5"
                    value={form.subject}
                    onChange={(v) => {
                      setForm((prev) => ({
                        ...prev,
                        subject: v,
                        subjectPendingApproval: false,
                      }));
                    }}
                    placeholder={t("postReq.subjectPlaceholder", "e.g. Mathematics, Python")}
                  />
                  <button
                    type="button"
                    className="mt-2 text-sm text-primary hover:underline disabled:opacity-60"
                    onClick={() => void handleAddNewSubject()}
                    disabled={addingSubject || !form.subject.trim()}
                  >
                    {addingSubject
                      ? t("postReq.addingSubject", "Adding subject…")
                      : t("postReq.addNewSubject", "If not in options above, add a new subject.")}
                  </button>
                  {form.subjectPendingApproval ? (
                    <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                      {t("postReq.subjectPendingHint", "This subject will need admin approval.")}
                    </p>
                  ) : null}
                </div>

                <div>
                  <Label>{t("postReq.level", "Your level")}</Label>
                  <Select value={form.level} onValueChange={(v) => update("level", v)}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEVEL_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.level === "other" ? (
                    <Input
                      className="mt-2"
                      value={form.levelOther}
                      onChange={(e) => update("levelOther", e.target.value)}
                      placeholder={t("postReq.levelOther", "Specify your level")}
                    />
                  ) : null}
                </div>

                <div>
                  <Label>{t("postReq.iWant", "I want")}</Label>
                  <Select
                    value={form.jobType}
                    onValueChange={(v) => update("jobType", v as "tutoring" | "assignment")}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tutoring">{t("postReq.tutoring", "Tutoring")}</SelectItem>
                      <SelectItem value="assignment">
                        {t("postReq.assignmentHelp", "Assignment help")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <fieldset>
                  <legend className="mb-2 text-sm font-medium leading-none">
                    {t("postReq.meetingOptions", "Meeting options")}
                  </legend>
                  <div className="space-y-2.5">
                    {(
                      [
                        {
                          key: "online" as const,
                          label: t("postReq.meetingOnline", "Online (using Zoom etc)"),
                        },
                        {
                          key: "atMyPlace" as const,
                          label: t("postReq.meetingAtMyPlace", "At my place (home/institute)"),
                        },
                        {
                          key: "travelToTutor" as const,
                          label: t("postReq.meetingTravel", "Travel to tutor"),
                        },
                      ] as const
                    ).map(({ key, label }) => (
                      <label key={key} className="flex cursor-pointer items-center gap-2.5 text-sm">
                        <Checkbox
                          checked={form.meetingOptions[key]}
                          onCheckedChange={(v) =>
                            setForm((prev) => ({
                              ...prev,
                              meetingOptions: { ...prev.meetingOptions, [key]: v === true },
                            }))
                          }
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div>
                  <Label htmlFor="req-budget">{t("postReq.budget", "Budget")}</Label>
                  <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
                    <div className="relative flex-1">
                      <span className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        {symbol}
                      </span>
                      <Input
                        id="req-budget"
                        type="number"
                        min={0}
                        value={form.budget}
                        onChange={(e) => update("budget", e.target.value)}
                        className="ps-7"
                      />
                    </div>
                    <div className="flex items-center gap-2 sm:w-[11rem]">
                      <span className="text-xs text-muted-foreground">{currency}</span>
                      <Select
                        value={form.budgetUnit}
                        onValueChange={(v) =>
                          update("budgetUnit", v as CreateRequirementPayload["budgetUnit"])
                        }
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {BUDGET_UNIT_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>{t("postReq.teacherGender", "Teacher's Gender")}</Label>
                  <Select
                    value={form.teacherGender}
                    onValueChange={(v) =>
                      update("teacherGender", v as FormState["teacherGender"])
                    }
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TEACHER_GENDER_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>{t("postReq.timeCommitment", "I need someone")}</Label>
                  <Select
                    value={form.timeCommitment}
                    onValueChange={(v) =>
                      update("timeCommitment", v as FormState["timeCommitment"])
                    }
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_COMMITMENT_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>{t("postReq.languages", "Languages")}</Label>
                  <LanguageMultiSelect
                    className="mt-1.5"
                    value={form.languages}
                    onChange={(languages) => update("languages", languages)}
                  />
                </div>

                <div>
                  <Label>{t("postReq.tutorOrigin", "Get tutors from")}</Label>
                  <Select value={form.tutorOrigin || "__none"} onValueChange={(v) => update("tutorOrigin", v === "__none" ? "" : v)}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="-- Select --" />
                    </SelectTrigger>
                    <SelectContent>
                      {TUTOR_ORIGIN_OPTIONS.map((o) => (
                        <SelectItem key={o.value || "__none"} value={o.value || "__none"}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="req-files">{t("postReq.uploadFiles", "Upload files")}</Label>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <Input
                      id="req-files"
                      type="file"
                      multiple
                      onChange={(e) => void handleFileChange(e)}
                      disabled={uploading || form.attachments.length >= 10}
                      className="cursor-pointer"
                    />
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : null}
                  </div>
                  {form.attachments.length > 0 ? (
                    <ul className="mt-2 space-y-1.5">
                      {form.attachments.map((file) => (
                        <li
                          key={file.url}
                          className="flex items-center justify-between gap-2 rounded-md border bg-muted/30 px-3 py-2 text-sm"
                        >
                          <span className="inline-flex min-w-0 items-center gap-1.5 truncate">
                            <Paperclip className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            <span className="truncate">{file.name}</span>
                          </span>
                          <button
                            type="button"
                            className="rounded-full p-0.5 hover:bg-muted"
                            onClick={() => removeAttachment(file.url)}
                            aria-label={t("postReq.removeFile", "Remove file")}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>

                <label className="flex cursor-pointer items-start gap-2.5 text-sm">
                  <Checkbox
                    checked={form.acceptedTerms}
                    onCheckedChange={(v) => update("acceptedTerms", v === true)}
                    className="mt-0.5"
                  />
                  <span>
                    {t("postReq.acceptTermsPrefix", "I accept")}{" "}
                    <Link to="/terms" className="font-medium text-primary hover:underline">
                      {t("postReq.termsAndConditions", "Terms and conditions")}
                    </Link>
                  </span>
                </label>

                <Button
                  type="submit"
                  size="lg"
                  variant="gradient"
                  className="w-full shadow-md"
                  disabled={createMut.isPending || uploading}
                >
                  {createMut.isPending ? (
                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="me-2 h-4 w-4" />
                  )}
                  {createMut.isPending ? t("postReq.submitting") : t("postReq.submit")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <StudentConfirmDialog
        open={studentDialogOpen}
        onOpenChange={setStudentDialogOpen}
        onContinueAsStudent={() => {
          setConfirmedStudent(true);
          void submitRequirement();
        }}
      />

      <RequirementVerifyDialog
        open={verifyOpen}
        onOpenChange={setVerifyOpen}
        phoneCountryCode={verifyPhone.countryCode}
        phone={verifyPhone.phone}
        emailSent={verifyEmailSent}
      />
    </div>
  );
}

export default Post;
