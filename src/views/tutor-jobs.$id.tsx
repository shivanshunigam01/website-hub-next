"use client";

import { Link, useParams } from "@/lib/navigation";
import { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRequirementDetail } from "@/hooks/use-requirements-api";
import { useMyJobApplication, useSubmitJobApplication } from "@/hooks/use-proposals-api";
import { useApp } from "@/hooks/use-app";
import { jobTypeLabel, requirementModeLabel } from "@/lib/tutor-jobs-utils";
import { useCurrency } from "@/hooks/use-currency";
import { formatApiErrorMessage } from "@/lib/api";
import { toast } from "sonner";

function TutorJobDetail() {
  const { formatLocalizedPrice } = useCurrency();
  const { id } = useParams();
  const { data: job, isLoading, isError } = useRequirementDetail(id);
  const { user, role } = useApp();
  const isTeacher = role === "teacher";
  const { data: myApplication, refetch: refetchApplication } = useMyJobApplication(
    id,
    isTeacher,
  );
  const submitMut = useSubmitJobApplication();

  const [message, setMessage] = useState("");
  const [rate, setRate] = useState("");
  const [sessions, setSessions] = useState("1");

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

  const submitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.info("Please sign in as a tutor to apply.");
      return;
    }
    if (!isTeacher) {
      toast.info("Only tutors can apply to student jobs.");
      return;
    }
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
      toast.error(formatApiErrorMessage(err, "Could not submit application"));
    }
  };

  const ModeIcon = job.mode === "offline" ? Home : Wifi;
  const loginRedirect = `/tutor-jobs/${id}`;

  return (
    <section className="container mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2 text-muted-foreground">
        <Link to="/tutor-jobs">
          <ArrowLeft className="mr-1 h-4 w-4" />
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
                  <ClipboardList className="mr-1 h-3 w-3" />
                  Assignment help
                </Badge>
              )}
              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                <ShieldCheck className="mr-1 h-3 w-3" />
                Approved
              </Badge>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              {job.subject} · {job.level}
            </span>
            <span className="inline-flex items-center gap-1">
              <ModeIcon className="h-4 w-4" />
              {requirementModeLabel(job.mode)}
            </span>
            {job.city || job.location ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {job.city || job.location}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1 font-medium text-foreground">
              Budget {formatLocalizedPrice(job.budget, job.currency)}/hr
            </span>
          </div>

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
            Posted by {job.studentName} on{" "}
            {new Date(job.createdAt).toLocaleDateString(undefined, {
              dateStyle: "medium",
            })}
          </p>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border bg-card p-6">
            <h2 className="font-display font-bold">Apply for this job</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Submit your proposal. Admin reviews applications and assigns the best tutor.
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
                  disabled={submitMut.isPending || !isTeacher}
                >
                  {submitMut.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Submit application
                </Button>
              </form>
            )}

            {!user && (
              <div className="mt-4 rounded-lg border bg-muted/30 p-3 text-center text-sm">
                <p className="text-muted-foreground">Sign in as a tutor to apply</p>
                <Button asChild size="sm" className="mt-2">
                  <Link to="/login" search={{ redirect: loginRedirect }}>
                    <LogIn className="mr-1.5 h-3.5 w-3.5" />
                    Log in
                  </Link>
                </Button>
              </div>
            )}
            {user && !isTeacher && (
              <p className="mt-4 text-center text-xs text-muted-foreground">
                Student accounts cannot apply.{" "}
                <Link to="/register" className="text-primary hover:underline">
                  Register as a tutor
                </Link>
              </p>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}

export default TutorJobDetail;
