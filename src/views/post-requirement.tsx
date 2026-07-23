"use client";

import { Link, useNavigate } from "@/lib/navigation";
import { canonicalUrl } from "@/lib/site-config";
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
import { useEffect, useState } from "react";
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

const LEVEL_OPTIONS = [
  { value: "elem", label: "Elementary" },
  { value: "middle", label: "Middle school" },
  { value: "high", label: "High school" },
  { value: "college", label: "College / University" },
  { value: "pro", label: "Professional" },
];

const DURATION_OPTIONS = [
  { value: "once", label: "One-time session" },
  { value: "month", label: "About a month" },
  { value: "semester", label: "One semester" },
  { value: "ongoing", label: "Ongoing" },
];

const QUICK_TITLES = [
  "Class 10 Math tutor for board exams",
  "IELTS speaking practice",
  "Python for beginners",
  "NEET Biology crash course",
];

const STEPS = [
  {
    step: "01",
    title: "Describe what you need",
    desc: "Subject, level, and goals — the more detail, the better the match.",
    icon: FileText,
  },
  {
    step: "02",
    title: "Set your preferences",
    desc: "Budget, online or in-person, and how often you want to meet.",
    icon: Calendar,
  },
  {
    step: "03",
    title: "Get matched fast",
    desc: "Verified tutors apply within hours. You pick who fits best.",
    icon: MessageCircle,
  },
];

const PERKS = [
  { icon: ShieldCheck, text: "Background-checked tutors only" },
  { icon: Clock, text: "Typical response in under 4 hours" },
  { icon: Users, text: "12,500+ active tutors worldwide" },
  { icon: Sparkles, text: "Free to post — pay only when you book" },
];

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
      toast.error("Please sign in as a student or parent to post a requirement.");
      return;
    }
    if (!profileComplete) {
      toast.error("Complete your profile registration before posting a requirement.");
      void nav({ to: afterAuthPath(role!, false, true) });
      return;
    }
    if (!form.subject.trim()) {
      toast.error("Please choose a subject.");
      return;
    }
    if (!form.title.trim() || !form.details.trim()) {
      toast.error("Please fill in the title and details.");
      return;
    }
    if (form.details.trim().length < 20) {
      toast.error("Please add more detail (at least 20 characters).");
      return;
    }
    if (form.level === "other" && !form.levelOther.trim()) {
      toast.error("Please specify the level.");
      return;
    }
    if (form.duration === "other" && !form.durationOther.trim()) {
      toast.error("Please specify the duration.");
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
      toast.success("Requirement submitted! Pending admin approval.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      toast.error(formatApiErrorMessage(err, "Could not submit requirement"));
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
                Sign in to post a requirement
              </h1>
              <p className="mt-4 text-base text-white/85">
                You need a free student account to submit a tutoring or assignment help request.
                After admin approval, your post goes live on Tutor Jobs.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button asChild size="lg" variant="secondary">
                  <Link to="/login" search={{ redirect: "/post-requirement" }}>
                    Sign in
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                  <Link to="/register">Create account</Link>
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
        <h1 className="font-display text-2xl font-bold">Students only</h1>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          Tutoring requirements can be posted by students and parents. Browse tutor jobs or find tutors instead.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild variant="outline">
            <Link to="/tutor-jobs">Browse tutor jobs</Link>
          </Button>
          <Button asChild>
            <Link to="/tutors">Find tutors</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      {/* Hero */}
      <div className="relative overflow-hidden border-b">
        <TutorPageBannerBackground />

        <div className="container relative mx-auto px-4 py-10 sm:px-6 sm:py-12 lg:py-14">
          <div className="max-w-3xl">
            <Badge className="mb-4 border-white/25 bg-white/15 text-white hover:bg-white/15">
              <Sparkles className="me-1 h-3 w-3" />
              Free to post
            </Badge>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Post a tutoring requirement
            </h1>
            <p className="mt-3 max-w-2xl text-base text-white/85 sm:text-lg">
              Tell us what you&apos;re looking for — verified tutors will reach out with tailored offers,
              usually within a few hours.
            </p>

            <div className="mt-6 flex flex-wrap gap-4 text-sm text-white/90">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                No commitment until you book
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                Avg. 4h first response
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" />
                Verified tutors only
              </span>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" variant="secondary" className="shadow-lg">
                <a href="#requirement-form">
                  Start your post
                  <ArrowRight className="ms-1 h-4 w-4" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                <Link to="/tutors">Browse tutors instead</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {myPosts.length > 0 && (
        <div className="container mx-auto px-4 pt-6 sm:px-6">
          <div className="rounded-2xl border bg-card p-5 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-lg font-bold">Your requirements</h2>
              <Button asChild variant="outline" size="sm">
                <Link to="/tutor-jobs">View tutor jobs</Link>
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
                      {post.subject} · {post.jobType === "assignment" ? "Assignment help" : "Tutoring"}
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
                Requirement submitted — pending review
              </p>
              <p className="mt-1 text-sm text-emerald-800/80 dark:text-emerald-200/80">
                Once an admin approves your post, it will appear on{" "}
                <Link to="/tutor-jobs" className="font-medium underline underline-offset-2">
                  Tutor Jobs
                </Link>
                . You&apos;ll receive an email at {user.email} when approved.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline" className="border-emerald-300 bg-white dark:bg-transparent">
                  <Link to="/tutors">Browse tutors while you wait</Link>
                </Button>
                <Button size="sm" variant="ghost" className="text-emerald-800 dark:text-emerald-200" onClick={() => setSubmitted(false)}>
                  Post another requirement
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-10 sm:px-6 md:py-14">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,500px)] lg:gap-14">
          {/* Left — trust & steps */}
          <div className="space-y-8 lg:sticky lg:top-24">
            <div>
              <h2 className="font-display text-xl font-bold sm:text-2xl">How it works</h2>
              <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                Three simple steps from posting to your first lesson.
              </p>
              <ol className="relative mt-8 space-y-0">
                {STEPS.map((s, i) => (
                  <li key={s.step} className="relative flex gap-4 pb-8 last:pb-0">
                    {i < STEPS.length - 1 && (
                      <span className="absolute start-5 top-11 h-[calc(100%-2.75rem)] w-px bg-border" aria-hidden />
                    )}
                    <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-4 ring-background">
                      <s.icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 pt-0.5">
                      <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                        Step {s.step}
                      </span>
                      <h3 className="mt-0.5 font-display font-bold">{s.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {PERKS.map((p) => (
                <div
                  key={p.text}
                  className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3.5 text-sm shadow-sm"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <p.icon className="h-4 w-4" />
                  </div>
                  {p.text}
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
                &ldquo;Found an IELTS tutor in 2 hours — exactly my budget.&rdquo;
              </p>
              <footer className="mt-3 text-sm text-muted-foreground">— Priya S., student</footer>
            </blockquote>
          </div>

          {/* Right — form */}
          <div id="requirement-form" className="scroll-mt-24">
            <form
              onSubmit={handleSubmit}
              className="overflow-hidden rounded-2xl border bg-card shadow-lg"
            >
              <div className="border-b bg-muted/30 px-6 py-5 sm:px-8">
                <h2 className="font-display text-xl font-bold">Your requirement</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Fill in the details below. Fields marked <span className="text-destructive">*</span> are required.
                </p>
              </div>

              <div className="space-y-8 p-6 sm:p-8">
                {/* Quick picks */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Quick examples
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_TITLES.map((title) => (
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

                {/* Post type */}
                <fieldset className="space-y-3">
                  <legend className="mb-1 text-sm font-semibold">What do you need?</legend>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        { value: "tutoring" as const, label: "Ongoing tutoring", icon: Briefcase },
                        { value: "assignment" as const, label: "Assignment help", icon: ClipboardList },
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

                {/* Basics */}
                <fieldset className="space-y-4">
                  <legend className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <BookOpen className="h-3.5 w-3.5" />
                    </span>
                    Basics
                  </legend>
                  <div>
                    <Label htmlFor="req-title">
                      Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="req-title"
                      value={form.title}
                      onChange={(e) => update("title", e.target.value)}
                      placeholder="e.g. Class 10 Math tutor for board exams"
                      required
                      className="mt-1.5"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label>Subject</Label>
                      <SubjectAutocomplete
                        className="mt-1.5"
                        value={form.subject}
                        onChange={(v) => update("subject", v)}
                        placeholder="Search or add a subject (e.g. Maths, Python)"
                      />
                    </div>
                    <div>
                      <Label>Level</Label>
                      <SelectWithOther
                        mode="enum-other"
                        className="mt-1.5"
                        options={LEVEL_OPTIONS}
                        value={form.level}
                        customValue={form.levelOther}
                        onValueChange={(v) => update("level", v)}
                        onCustomValueChange={(v) => update("levelOther", v)}
                        otherPlaceholder="Describe the level"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Skills (optional)</Label>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Add skills from the master list, or type a new one to grow the catalog.
                    </p>
                    <div className="mt-1.5 flex gap-2">
                      <SubjectAutocomplete
                        className="flex-1"
                        showIcon={false}
                        value={skillDraft}
                        onChange={setSkillDraft}
                        placeholder="e.g. Algebra, DBMS, IELTS"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => addSkill(skillDraft)}
                        disabled={!skillDraft.trim()}
                      >
                        Add
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
                              aria-label={`Remove ${skill}`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </fieldset>

                {/* Format */}
                <fieldset className="space-y-4 rounded-xl border bg-muted/20 p-4 sm:p-5">
                  <legend className="mb-1 flex items-center gap-2 px-1 text-sm font-semibold">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <MapPin className="h-3.5 w-3.5" />
                    </span>
                    Format & schedule
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        { value: "online" as const, label: "Online", icon: Wifi },
                        { value: "offline" as const, label: "In-person", icon: WifiOff },
                        { value: "both" as const, label: "Either", icon: Users },
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
                      <Label>Sessions per week</Label>
                      <Select value={form.sessionsPerWeek} onValueChange={(v) => update("sessionsPerWeek", v)}>
                        <SelectTrigger className="mt-1.5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map((n) => (
                            <SelectItem key={n} value={String(n)}>
                              {n}× per week
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="req-location">City / timezone</Label>
                      <Input
                        id="req-location"
                        value={form.location}
                        onChange={(e) => update("location", e.target.value)}
                        placeholder="e.g. Mumbai · IST"
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                </fieldset>

                {/* Budget */}
                <fieldset className="space-y-4">
                  <legend className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <DollarSign className="h-3.5 w-3.5" />
                    </span>
                    Budget
                  </legend>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="req-budget">Budget per hour ({currency})</Label>
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
                      <Label>Duration</Label>
                      <SelectWithOther
                        mode="enum-other"
                        className="mt-1.5"
                        options={DURATION_OPTIONS}
                        value={form.duration}
                        customValue={form.durationOther}
                        onValueChange={(v) => update("duration", v)}
                        onCustomValueChange={(v) => update("durationOther", v)}
                        otherPlaceholder="Describe the duration"
                      />
                    </div>
                  </div>
                </fieldset>

                {/* Details */}
                <fieldset className="space-y-4">
                  <legend className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileText className="h-3.5 w-3.5" />
                    </span>
                    Details
                  </legend>
                  <div>
                    <Label htmlFor="req-details">
                      Tell tutors more <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="req-details"
                      value={form.details}
                      onChange={(e) => update("details", e.target.value)}
                      required
                      placeholder="Goals, current level, preferred times, exam dates, teaching style…"
                      className="mt-1.5 min-h-[140px] resize-y"
                    />
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      Tip: mention exam dates, preferred days, and whether you need homework help or concept clarity.
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
                  {createMut.isPending ? "Submitting…" : "Submit for admin review"}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  By posting, you agree to our{" "}
                  <Link to="/terms" className="font-medium text-primary underline-offset-2 hover:underline">
                    terms
                  </Link>
                  . You can edit or remove your post anytime from your dashboard.
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
