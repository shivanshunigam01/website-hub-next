"use client";

import { Link, useNavigate } from "@/lib/navigation";
import { useEffect, type ReactNode } from "react";
import { useApp } from "@/hooks/use-app";
import type { AuthRole } from "@/lib/auth-types";
import { afterAuthPath } from "@/lib/auth-redirect";
import { Button } from "@/components/ui/button";

type Props = {
  children: ReactNode;
  roles?: AuthRole[];
  /** When true (default), incomplete profiles are redirected to setup */
  requireProfileComplete?: boolean;
};

export function RequireAuth({ children, roles, requireProfileComplete = true }: Props) {
  const { user, role, loading, profileComplete } = useApp();
  const nav = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      const staffOnly = roles?.length === 1 && roles[0] === "admin";
      nav({ to: staffOnly ? "/staff-console" : "/login" });
      return;
    }
    if (roles?.length && role && !roles.includes(role)) {
      nav({ to: `/${role}` as "/student" | "/teacher" | "/admin" | "/parent" });
      return;
    }
    if (
      requireProfileComplete &&
      role &&
      (role === "student" || role === "teacher" || role === "parent")
    ) {
      const verified =
        user.provider === "whatsapp" || !user.email ? true : user.isVerified !== false;
      if (!verified || !profileComplete) {
        nav({ to: afterAuthPath(role, profileComplete, verified) });
      }
    }
  }, [loading, user, role, roles, requireProfileComplete, profileComplete, nav]);

  if (loading) {
    return (
      <div className="container py-20 text-center text-muted-foreground">Loading…</div>
    );
  }

  if (!user) {
    const staffOnly = roles?.length === 1 && roles[0] === "admin";
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground">Please sign in to continue.</p>
        <Button className="mt-4" asChild>
          <Link to={staffOnly ? "/staff-console" : "/login"}>Log in</Link>
        </Button>
      </div>
    );
  }

  if (roles?.length && role && !roles.includes(role)) {
    return (
      <div className="container py-20 text-center text-muted-foreground">
        You do not have access to this page.
      </div>
    );
  }

  if (
    requireProfileComplete &&
    role &&
    (role === "student" || role === "teacher" || role === "parent")
  ) {
    const verified =
      user.provider === "whatsapp" || !user.email ? true : user.isVerified !== false;
    if (!verified || !profileComplete) {
      return (
        <div className="container py-20 text-center text-muted-foreground">
          Complete your profile to access this area…
        </div>
      );
    }
  }

  return <>{children}</>;
}
