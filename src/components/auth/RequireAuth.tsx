"use client";

import { Link, useNavigate } from "@/lib/navigation";
import { useEffect, type ReactNode } from "react";
import { useApp } from "@/hooks/use-app";
import type { AuthRole } from "@/lib/auth-types";
import { Button } from "@/components/ui/button";

type Props = {
  children: ReactNode;
  roles?: AuthRole[];
};

export function RequireAuth({ children, roles }: Props) {
  const { user, role, loading } = useApp();
  const nav = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      nav({ to: "/login" });
      return;
    }
    if (roles?.length && role && !roles.includes(role)) {
      nav({ to: `/${role}` as "/student" | "/teacher" | "/admin" | "/parent" });
    }
  }, [loading, user, role, roles, nav]);

  if (loading) {
    return (
      <div className="container py-20 text-center text-muted-foreground">Loading…</div>
    );
  }

  if (!user) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground">Please sign in to continue.</p>
        <Button className="mt-4" asChild>
          <Link to="/login">Log in</Link>
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

  return <>{children}</>;
}
