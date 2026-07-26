"use client";

import { Link, useNavigate } from "@/lib/navigation";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  MapPin,
  MessageCircle,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Wifi,
  ClipboardList,
  Briefcase,
  LogIn,
  Loader2,
  WifiOff,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SelectWithOther } from "@/components/ui/SelectWithOther";
import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/hooks/use-app";
import { useCreateRequirement, useMyRequirements } from "@/hooks/use-requirements-api";
import { useCurrency } from "@/hooks/use-currency";
import { formatApiErrorMessage } from "@/lib/api";
import { afterAuthPath } from "@/lib/auth-redirect";
import { requirementStatusClass, requirementStatusLabel } from "@/lib/tutor-jobs-utils";
import { TutorPageBannerBackground } from "@/components/tutors/TutorPageBannerBackground";
import { SubjectAutocomplete } from "@/components/tutors/SubjectAutocomplete";
import { normalizeSubjectName } from "@/lib/subject-name";
import { cn } from "@/lib/utils";

const LEVEL_OPTION_KEYS = [
  { value: "elem", key: "postReq.level.elem" },
  { value: "middle", key: "postReq.level.middle" },
  { value: "high", key: "postReq.level.high" },
  { value: "college", key: "postReq.level.college" },
  { value: "pro", key: "postReq.level.pro" },
] as const;

const DURATION_OPTION_KEYS = [
  { value: "once", key: "postReq.duration.once" },
  { value: "month", key: "postReq.duration.month" },
  { value: "semester", key: "postReq.duration.semester" },
  { value: "ongoing", key: "postReq.duration.ongoing" },
] as const;

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

type FormState = {
  title: string;
  subject: string;
  skills: string[];
  level: string;
  levelOther: string;
  jobType: "tutoring" | "assignment";
  mode: "online" | "offline" | "both";
  sessionsPerWeek: string;
  location: string;
  country: string;
  budget: string;
  duration: string;
  durationOther: string;
  details: string;
};

const INITIAL_FORM: FormState = {
  title: "",
  subject: "Mathematics",
  skills: [],
  level: "high",
  levelOther: "",
  jobType: "tutoring",
  mode: "online",
  sessionsPerWeek: "3",
  location: "",
  country: "",
  budget: "30",
  duration: "ongoing",
  durationOther: "",
  details: "",
};

function Post() {
  const { t } = useTranslation("common");
  const { user, role, loading: authLoading, profileComplete } = useApp();
  const createMut = useCreateRequirement();
  const { data: myPosts = [], refetch: refetchMine } = useMyRequirements(
    !!user && (role === "student" || role === "parent") && profileComplete,
  );
  const { currency, symbol } = useCurrency();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [skillDraft, setSkillDraft] = useState("");
  const nav = useNavigate();

  const canPost = role === "student" || role === "parent";

  const levelOptions = useMemo(
    () => LEVEL_OPTION_KEYS.map((o) => ({ value: o.value, label: t(o.key) })),
    [t],
  );
  const durationOptions = useMemo(
    () => DURATION_OPTION_KEYS.map((o) => ({ value: o.value, label: t(o.key) })),
    [t],
  );
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

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addSkill = (raw: string) => {
    const name = normalizeSubjectName(raw);
    if (!name) return;
    setForm((prev) => {
      if (prev.skills.some((s) => s.toLowerCase() === name.toLowerCase())) return prev;
      return { ...prev, skills: [...prev.skills, name] };
    });
    setSkillDraft("");
  };

  const removeSkill = (name: string) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s.toLowerCase() !== name.toLowerCase()),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !canPost) {
      toast.error(t("postReq.toastSignIn", "Please sign in as a student or parent to post a requirement."));
      return;
    }
    if (!profileComplete) {
      toast.error(t("postReq.toastCompleteProfile", "Complete your profile registration before posting a requirement."));
      void nav({ to: afterAuthPath(role!, false, true) });
      return;
    }
    if (!form.subject.trim()) {
      toast.error(t("postReq.toastSubject", "Please choose a subject."));
      return;
    }
    if (!form.title.trim() || !form.details.trim()) {
      toast.error(t("postReq.toastTitleDetails", "Please fill in the title and details."));
      return;
    }
    if (form.details.trim().length < 20) {
      toast.error(t("postReq.toastMoreDetail", "Please add more detail (at least 20 characters)."));
      return;
    }
    if (form.level === "other" && !form.levelOther.trim()) {
      toast.error(t("postReq.toastLevel", "Please specify the level."));
      return;
    }
    if (form.duration === "other" && !form.durationOther.trim()) {
      toast.error(t("postReq.toastDuration", "Please specify the duration."));
      return;
    }
    try {
      await createMut.mutateAsync({
        title: form.title.trim(),
        subject: form.subject.trim(),
        skills: form.skills.length ? form.skills : undefined,
        level: form.level,
        levelOther: form.level === "other" ? form.levelOther.trim() : undefined,
        jobType: form.jobType,
        mode: form.mode,
        sessionsPerWeek: Number(form.sessionsPerWeek) || undefined,
        city: form.location.trim(),
        country: form.country.trim() || undefined,
        budgetPerHour: Number(form.budget) || 0,
        currency,
        duration: form.duration,
        durationOther: form.duration === "other" ? form.durationOther.trim() : undefined,
        details: form.details.trim(),
      });
      setSubmitted(true);
      setForm(INITIAL_FORM);
      setSkillDraft("");
      refetchMine();
      toast.success(t("postReq.toastSubmitted", "Requirement submitted! Pending admin approval."));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      toast.error(formatApiErrorMessage(err, t("postReq.toastSubmitFailed", "Could not submit requirement")));
    }
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
              <p className="mt-4 text-base text-white/85">
                {t("postReq.signInSubtitle")}
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button asChild size="lg" variant="secondary">
                  <Link to="/login" search={{ redirect: "/post-requirement" }}>
                    {t("postReq.signIn")}
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white">
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
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          {t("postReq.studentsOnlyDesc")}
        </p>
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
            <p className="mt-3 max-w-2xl text-base text-white/85 sm:text-lg">
              {t("postReq.subtitle")}
            </p>

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
              <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white">
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
                <Link to="/tutor-jobs">{t("postReq.viewTutorJobs")}</Link>
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
                  <Link to="/tutors">{t("postReq.browseWhileWait")}</Link>
                </Button>
                <Button size="sm" variant="ghost" className="text-emerald-800 dark:text-emerald-200" onClick={() => setSubmitted(false)}>
                  {t("postReq.postAnother")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-10 sm:px-6 md:py-14">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,500px)] lg:gap-14">
          <div className="space-y-8 lg:sticky lg:top-24">
            <div>
              <h2 className="font-display text-xl font-bold sm:text-2xl">{t("postReq.howTitle")}</h2>
              <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                {t("postReq.howSubtitle")}
              </p>
              <ol className="relative mt-8 space-y-0">
                {STEP_KEYS.map((s, i) => (
                  <li key={s.titleKey} className="relative flex gap-4 pb-8 last:pb-0">
                    {i < STEP_KEYS.length - 1 && (
                      <span className="absolute start-5 top-11 h-[calc(100%-2.75rem)] w-px bg-border" aria-hidden />
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
            <form
              onSubmit={handleSubmit}
              className="overflow-hidden rounded-2xl border bg-card shadow-lg"
            >
              <div className="border-b bg-muted/30 px-6 py-5 sm:px-8">
                <h2 className="font-display text-xl font-bold">{t("postReq.formTitle")}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("postReq.formHint")}
                </p>
              </div>

              <div className="space-y-8 p-6 sm:p-8">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
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

                <fieldset className="space-y-3">
                  <legend className="mb-1 text-sm font-semibold">{t("postReq.whatNeed")}</legend>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        { value: "tutoring" as const, label: t("postReq.ongoingTutoring"), icon: Briefcase },
                        { value: "assignment" as const, label: t("postReq.assignmentHelp"), icon: ClipboardList },
                      ] as const
                    ).map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => update("jobType", value)}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm transition",
                          form.jobType === value
                            ? "border-primary bg-primary/10 font-medium text-primary"
                            : "border-border bg-background hover:border-primary/40",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <fieldset className="space-y-4">
                  <legend className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <BookOpen className="h-3.5 w-3.5" />
                    </span>
                    {t("postReq.basics")}
                  </legend>
                  <div>
                    <Label htmlFor="req-title">
                      {t("postReq.titleLabel")} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="req-title"
                      value={form.title}
                      onChange={(e) => update("title", e.target.value)}
                      placeholder={t("postReq.titlePlaceholder")}
                      required
                      className="mt-1.5"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label>{t("postReq.subject")}</Label>
                      <SubjectAutocomplete
                        className="mt-1.5"
                        value={form.subject}
                        onChange={(v) => update("subject", v)}
                        placeholder={t("postReq.subjectPlaceholder")}
                      />
                    </div>
                    <div>
                      <Label>{t("postReq.level")}</Label>
                      <SelectWithOther
                        mode="enum-other"
                        className="mt-1.5"
                        options={levelOptions}
                        value={form.level}
                        customValue={form.levelOther}
                        onValueChange={(v) => update("level", v)}
                        onCustomValueChange={(v) => update("levelOther", v)}
                        otherPlaceholder={t("postReq.levelOther")}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>{t("postReq.skills")}</Label>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {t("postReq.skillsHint")}
                    </p>
                    <div className="mt-1.5 flex gap-2">
                      <SubjectAutocomplete
                        className="flex-1"
                        showIcon={false}
                        value={skillDraft}
                        onChange={setSkillDraft}
                        placeholder={t("postReq.skillsPlaceholder")}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => addSkill(skillDraft)}
                        disabled={!skillDraft.trim()}
                      >
                        {t("postReq.add")}
                      </Button>
                    </div>
                    {form.skills.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {form.skills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="gap-1 pr-1 font-normal">
                            {skill}
                            <button
                              type="button"
                              className="rounded-full p-0.5 hover:bg-muted"
                              onClick={() => removeSkill(skill)}
                              aria-label={t("postReq.removeSkill", "Remove {{skill}}", { skill })}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </fieldset>

                <fieldset className="space-y-4 rounded-xl border bg-muted/20 p-4 sm:p-5">
                  <legend className="mb-1 flex items-center gap-2 px-1 text-sm font-semibold">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <MapPin className="h-3.5 w-3.5" />
                    </span>
                    {t("postReq.formatSchedule")}
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        { value: "online" as const, label: t("postReq.modeOnline"), icon: Wifi },
                        { value: "offline" as const, label: t("postReq.modeInPerson"), icon: WifiOff },
                        { value: "both" as const, label: t("postReq.modeEither"), icon: Users },
                      ] as const
                    ).map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => update("mode", value)}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition",
                          form.mode === value
                            ? "border-primary bg-primary/10 font-medium text-primary"
                            : "border-border bg-background hover:border-primary/40",
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label>{t("postReq.sessionsPerWeek")}</Label>
                      <Select value={form.sessionsPerWeek} onValueChange={(v) => update("sessionsPerWeek", v)}>
                        <SelectTrigger className="mt-1.5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map((n) => (
                            <SelectItem key={n} value={String(n)}>
                              {t("postReq.sessionsN", { n })}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="req-location">{t("postReq.cityTimezone")}</Label>
                      <Input
                        id="req-location"
                        value={form.location}
                        onChange={(e) => update("location", e.target.value)}
                        placeholder={t("postReq.cityPlaceholder")}
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                </fieldset>

                <fieldset className="space-y-4">
                  <legend className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <DollarSign className="h-3.5 w-3.5" />
                    </span>
                    {t("postReq.budget")}
                  </legend>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="req-budget">{t("postReq.budgetPerHour", { currency })}</Label>
                      <div className="relative mt-1.5">
                        <span className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                          {symbol}
                        </span>
                        <Input
                          id="req-budget"
                          type="number"
                          value={form.budget}
                          onChange={(e) => update("budget", e.target.value)}
                          min={5}
                          className="ps-7"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>{t("postReq.duration")}</Label>
                      <SelectWithOther
                        mode="enum-other"
                        className="mt-1.5"
                        options={durationOptions}
                        value={form.duration}
                        customValue={form.durationOther}
                        onValueChange={(v) => update("duration", v)}
                        onCustomValueChange={(v) => update("durationOther", v)}
                        otherPlaceholder={t("postReq.durationOther")}
                      />
                    </div>
                  </div>
                </fieldset>

                <fieldset className="space-y-4">
                  <legend className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileText className="h-3.5 w-3.5" />
                    </span>
                    {t("postReq.details")}
                  </legend>
                  <div>
                    <Label htmlFor="req-details">
                      {t("postReq.detailsLabel")} <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="req-details"
                      value={form.details}
                      onChange={(e) => update("details", e.target.value)}
                      required
                      placeholder={t("postReq.detailsPlaceholder")}
                      className="mt-1.5 min-h-[140px] resize-y"
                    />
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {t("postReq.detailsTip")}
                    </p>
                  </div>
                </fieldset>

                <Button
                  type="submit"
                  size="lg"
                  variant="gradient"
                  className="w-full shadow-md"
                  disabled={createMut.isPending}
                >
                  <Send className="me-2 h-4 w-4" />
                  {createMut.isPending ? t("postReq.submitting") : t("postReq.submit")}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  {t("postReq.agreeTerms")}
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Post;
