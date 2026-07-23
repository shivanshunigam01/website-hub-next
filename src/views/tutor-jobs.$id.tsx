"use client";

import { Link, useNavigate, useParams } from "@/lib/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  MapPin,
  Send,
  ShieldCheck,
  Wifi,
  Home,
  Loader2,
  ClipboardList,
  LogIn,
  Clock,
  User,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRequirementDetail } from "@/hooks/use-requirements-api";
import { useMyJobApplication, useSubmitJobApplication } from "@/hooks/use-proposals-api";
import { useApp } from "@/hooks/use-app";
import {
  jobTypeLabel,
  posterDisplayName,
  posterRoleLabel,
  postedByLine,
  requirementModeLabel,
} from "@/lib/tutor-jobs-utils";
import { afterAuthPath, TEACHER_ONBOARDING_PATH } from "@/lib/auth-redirect";
import { useCurrency } from "@/hooks/use-currency";
import { ApiRequestError, formatApiErrorMessage } from "@/lib/api";
import { toast } from "sonner";

function relativePosted(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" });
}

function TutorJobDetail() {
  const { formatLocalizedPrice } = useCurrency();
  const { id } = useParams();
  const nav = useNavigate();
  const { data: job, isLoading, isError } = useRequirementDetail(id);
  const { user, role, profileComplete } = useApp();
  const isTeacher = role === "teacher";
  const { data: myApplication, refetch: refetchApplication } = useMyJobApplication(
    id,
    isTeacher,
  );
  const submitMut = useSubmitJobApplication();
  const applyRef = useRef<HTMLDivElement>(null);

  const [message, setMessage] = useState("");
  const [rate, setRate] = useState("");
  const [sessions, setSessions] = useState("1");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash.replace(/^#/, "") !== "apply") return;
    const t = window.setTimeout(() => {
      applyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
    return () => window.clearTimeout(t);
  }, [job?.id, isLoading]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !job || job.status !== "approved") {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="font-display text-xl font-bold">Job not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This job may be pending approval, filled, or removed.
        </p>
        <Button asChild className="mt-6">
          <Link to="/tutor-jobs">Browse tutor jobs</Link>
        </Button>
      </div>
    );
  }

  const posterName = posterDisplayName(job);
  const loginRedirect = `/tutor-jobs/${id}#apply`;

  const ensureTeacherCanApply = () => {
    if (!user) {
      toast.info("Please sign in as a tutor to apply.");
      void nav({ to: "/login", search: { redirect: loginRedirect } });
      return false;
    }
    if (!isTeacher) {
      toast.info("Only tutors can apply to these jobs. Parents and students post requirements instead.");
      return false;
    }
    const verified =
      user.provider === "whatsapp" || !user.email ? true : user.isVerified !== false;
    if (!verified) {
      toast.info("Verify your email before applying.");
      void nav({ to: "/verify-email" });
      return false;
    }
    if (!profileComplete || !user.profileComplete) {
      toast.info("Complete your tutor profile before applying.");
      void nav({ to: TEACHER_ONBOARDING_PATH });
      return false;
    }
    return true;
  };

  const scrollToApply = () => {
    if (!ensureTeacherCanApply()) return;
    applyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    const messageEl = document.getElementById("message");
    messageEl?.focus();
  };

  const submitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ensureTeacherCanApply()) return;

    const trimmed = message.trim();
    if (trimmed.length < 10) {
      toast.error("Write a short message about how you can help (at least 10 characters).");
      return;
    }
    try {
      await submitMut.mutateAsync({
        requirementId: job.id,
        message: trimmed,
        proposedRate: Number(rate) || job.budget,
        sessions: Number(sessions) || 1,
      });
      setMessage("");
      await refetchApplication();
      toast.success("Application sent! Admin will review and notify you by email.");
    } catch (err) {
      const msg = formatApiErrorMessage(err, "Could not submit application");
      if (err instanceof ApiRequestError && err.status === 403) {
        if (/profile/i.test(msg)) {
          void nav({
            to: afterAuthPath("teacher", false, user?.isVerified !== false),
          });
        } else if (/email|verif/i.test(msg)) {
          void nav({ to: "/verify-email" });
        }
      }
      toast.error(msg);
    }
  };

  const ModeIcon = job.mode === "offline" ? Home : Wifi;

  return (
    <section className="container mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Button variant="ghost" size="sm" asChild className="mb-6 -ms-2 text-muted-foreground">
        <Link to="/tutor-jobs">
          <ArrowLeft className="me-1 h-4 w-4" />
          Back to jobs
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="rounded-2xl border bg-card p-6 md:p-8">
          <div className="flex flex-wrap items-start gap-2">
            <h1 className="flex-1 font-display text-2xl font-extrabold md:text-3xl">{job.title}</h1>
            <div className="flex flex-wrap gap-1.5">
              {job.jobType === "assignment" && (
                <Badge variant="outline">
                  <ClipboardList className="me-1 h-3 w-3" />
                  Assignment help
                </Badge>
              )}
              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                <ShieldCheck className="me-1 h-3 w-3" />
                Approved
              </Badge>
            </div>
          </div>

          {!myApplication && (
            <Button
              type="button"
              size="lg"
              variant="gradient"
              className="mt-5 w-full sm:w-auto"
              onClick={scrollToApply}
            >
              <Send className="me-2 h-4 w-4" />
              Contact {posterName}
            </Button>
          )}

          <div className="mt-4 flex flex-wrap gap-1.5">
            <Badge variant="secondary">{job.subject}</Badge>
            <Badge variant="outline">{job.level}</Badge>
          </div>

          <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
            {(job.city || job.location) && (
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{[job.location, job.city, job.country].filter(Boolean).join(", ") || job.city || job.location}</span>
              </li>
            )}
            <li className="flex items-start gap-2">
              <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                Rate: {formatLocalizedPrice(job.budget, job.currency)}/hr · {requirementModeLabel(job.mode)}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>Posted: {relativePosted(job.createdAt)}</span>
            </li>
            {job.sessionsPerWeek ? (
              <li className="flex items-start gap-2">
                <ModeIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>About {job.sessionsPerWeek} session{job.sessionsPerWeek === 1 ? "" : "s"} / week</span>
              </li>
            ) : null}
            <li className="flex items-start gap-2">
              <User className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span className="inline-flex flex-wrap items-center gap-1.5">
                <span>
                  Posted by: <strong className="text-foreground">{posterName}</strong> (
                  {posterRoleLabel(job.posterRole)})
                </span>
                <span title="Who posted this tutoring need">
                  <Info className="h-3.5 w-3.5" />
                </span>
                {job.posterVerified ? (
                  <Badge
                    variant="outline"
                    className="border-emerald-300 text-emerald-700 dark:text-emerald-300"
                  >
                    <ShieldCheck className="me-1 h-3 w-3" />
                    Verified
                  </Badge>
                ) : null}
              </span>
            </li>
          </ul>

          {job.skills?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {job.skills.map((s) => (
                <Badge key={s} variant="secondary">
                  {s}
                </Badge>
              ))}
            </div>
          )}

          <div className="mt-6 border-t pt-6">
            <h2 className="font-display font-bold">{jobTypeLabel(job.jobType)} details</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {job.details}
            </p>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            {postedByLine(job)} on{" "}
            {new Date(job.createdAt).toLocaleDateString(undefined, {
              dateStyle: "medium",
            })}
          </p>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div id="apply" ref={applyRef} className="scroll-mt-28 rounded-2xl border bg-card p-6">
            <h2 className="font-display font-bold">
              {myApplication ? "Your application" : `Contact ${posterName}`}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Submit your proposal to apply for this job. Admin reviews applications and assigns the
              best tutor.
            </p>

            {myApplication ? (
              <div
                className={`mt-4 rounded-xl border p-4 text-sm ${
                  myApplication.status === "approved"
                    ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/30"
                    : myApplication.status === "rejected"
                      ? "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30"
                      : "border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30"
                }`}
              >
                <p className="font-semibold capitalize">{myApplication.status}</p>
                <p className="mt-1 text-muted-foreground">
                  {formatLocalizedPrice(myApplication.proposedRate, job.currency)}/hr ·{" "}
                  {myApplication.sessions} session{myApplication.sessions === 1 ? "" : "s"}
                </p>
                <p className="mt-2">{myApplication.message}</p>
                {myApplication.status === "pending" && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Waiting for admin review. You will receive an email when decided.
                  </p>
                )}
                {myApplication.status === "approved" && (
                  <Button asChild size="sm" className="mt-3" variant="outline">
                    <Link to="/teacher">View in my dashboard</Link>
                  </Button>
                )}
              </div>
            ) : (
              <form onSubmit={submitProposal} className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="rate">Your rate ({job.currency}/hr)</Label>
                  <Input
                    id="rate"
                    type="number"
                    min={1}
                    className="mt-1"
                    placeholder={String(job.budget)}
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    disabled={!isTeacher}
                  />
                </div>
                <div>
                  <Label htmlFor="sessions">Sessions offered</Label>
                  <Input
                    id="sessions"
                    type="number"
                    min={1}
                    className="mt-1"
                    value={sessions}
                    onChange={(e) => setSessions(e.target.value)}
                    disabled={!isTeacher}
                  />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    rows={4}
                    className="mt-1"
                    placeholder="Explain your experience and availability…"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={2000}
                    disabled={!isTeacher}
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  variant="gradient"
                  className="w-full"
                  disabled={submitMut.isPending}
                  onClick={(e) => {
                    if (!isTeacher || !user) {
                      e.preventDefault();
                      ensureTeacherCanApply();
                    }
                  }}
                >
                  {submitMut.isPending ? (
                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="me-2 h-4 w-4" />
                  )}
                  Contact {posterName}
                </Button>
              </form>
            )}

            {!user && (
              <div className="mt-4 rounded-lg border bg-muted/30 p-3 text-center text-sm">
                <p className="text-muted-foreground">Sign in as a tutor to apply</p>
                <Button asChild size="sm" className="mt-2">
                  <Link to="/login" search={{ redirect: loginRedirect }}>
                    <LogIn className="me-1.5 h-3.5 w-3.5" />
                    Log in
                  </Link>
                </Button>
              </div>
            )}
            {user && !isTeacher && (
              <div className="mt-4 rounded-lg border bg-muted/30 p-3 text-center text-sm">
                <p className="text-muted-foreground">
                  {role === "parent" || role === "student"
                    ? "Parents and students post tutoring needs — they do not apply to jobs."
                    : "Only tutor accounts can apply to jobs."}
                </p>
                {(role === "parent" || role === "student") && (
                  <Button asChild size="sm" className="mt-2" variant="outline">
                    <Link to="/post-requirement">Request a tutor</Link>
                  </Button>
                )}
                {role !== "parent" && role !== "student" && (
                  <Button asChild size="sm" className="mt-2" variant="outline">
                    <Link to="/register" search={{ role: "teacher" }}>
                      Register as a tutor
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}

export default TutorJobDetail;
