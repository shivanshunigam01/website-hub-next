"use client";

import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { useNavigate } from "@/lib/navigation";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import type { ProfileCompletionProgress as ProfileProgress } from "@/lib/auth-types";
import { TEACHER_ONBOARDING_PATH } from "@/lib/auth-redirect";
import { PROFILE_CHECK_LABELS } from "@/lib/teacher-profile-utils";
import { cn } from "@/lib/utils";

const FORM_ANCHOR = "teacher-profile-form";

export function scrollToTeacherProfileForm() {
  const el = document.getElementById(FORM_ANCHOR);
  if (!el) return false;
  const top = el.getBoundingClientRect().top + window.scrollY - 96;
  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  return true;
}

function scrollToProfileForm() {
  return scrollToTeacherProfileForm();
}

type Props = {
  progress: ProfileProgress;
  className?: string;
  /** When true, scroll to the form on this page instead of navigating */
  onSamePage?: boolean;
};

export function ProfileCompletionProgress({ progress, className, onSamePage }: Props) {
  const nav = useNavigate();
  const incomplete = progress.percent < 100;

  const goToProfileForm = () => {
    if (onSamePage && scrollToProfileForm()) {
      window.history.replaceState(null, "", `#${FORM_ANCHOR}`);
      return;
    }
    nav({
      to: TEACHER_ONBOARDING_PATH,
      hash: FORM_ANCHOR,
    });
  };

  return (
    <div className={cn("rounded-2xl border bg-card p-4", className)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Profile completion</p>
          <p className="text-xs text-muted-foreground">
            {progress.completed} of {progress.total} required sections
          </p>
        </div>
        <span className="font-display text-2xl font-bold text-primary">{progress.percent}%</span>
      </div>
      <Progress value={progress.percent} className="mb-4 h-2" />
      <ul className="grid gap-2 sm:grid-cols-2">
        {(Object.entries(progress.checks) as [keyof typeof progress.checks, boolean][]).map(
          ([key, done]) => (
            <li key={key} className="flex items-center gap-2 text-sm">
              {done ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
              ) : (
                <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
              <span className={done ? "text-foreground" : "text-muted-foreground"}>
                {PROFILE_CHECK_LABELS[key]}
              </span>
            </li>
          ),
        )}
      </ul>
      {incomplete && (
        <Button type="button" className="mt-4 w-full sm:w-auto" onClick={goToProfileForm}>
          Complete profile
          <ArrowRight className="ms-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
