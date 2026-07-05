"use client";

import { useNavigate } from "@/lib/navigation";
import { useEffect, type ReactNode } from "react";
import { useApp } from "@/hooks/use-app";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/navigation";

type Props = {
  children: ReactNode;
  /** When true, incomplete teachers are redirected to onboarding */
  requireComplete?: boolean;
};

export function RequireTeacherProfile({ children, requireComplete = true }: Props) {
  const { user, role, loading } = useApp();
  const nav = useNavigate();

  useEffect(() => {
    if (loading || !user || role !== "teacher") return;
    if (!user.isVerified) {
      nav({ to: "/verify-email" });
      return;
    }
    if (requireComplete && !user.profileComplete) {
      nav({ to: "/teacher/onboarding/profile" });
    }
  }, [loading, user, role, requireComplete, nav]);

  if (loading) {
    return <div className="container py-20 text-center text-muted-foreground">Loading…</div>;
  }

  if (!user || role !== "teacher") {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground">Teacher account required.</p>
        <Button className="mt-4" asChild>
          <Link to="/login">Log in</Link>
        </Button>
      </div>
    );
  }

  if (requireComplete && !user.profileComplete) {
    return (
      <div className="container py-20 text-center text-muted-foreground">
        Redirecting to profile setup…
      </div>
    );
  }

  return <>{children}</>;
}
