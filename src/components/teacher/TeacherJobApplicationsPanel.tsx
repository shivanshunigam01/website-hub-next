"use client";

import { Link } from "@/lib/navigation";
import { Briefcase, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMyJobApplications } from "@/hooks/use-proposals-api";
import { formatPrice } from "@/lib/currencies";

const STATUS_CLASS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

export function TeacherJobApplicationsPanel() {
  const { data: applications = [], isLoading } = useMyJobApplications();

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-8 text-center">
        <Briefcase className="mx-auto h-10 w-10 text-muted-foreground/50" />
        <p className="mt-3 font-medium">No job applications yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse tutor jobs and apply — approved assignments appear here.
        </p>
        <Button asChild className="mt-4" size="sm">
          <Link to="/tutor-jobs">Browse tutor jobs</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {applications.map((app) => (
        <div key={app.id} className="rounded-xl border bg-card p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <Link
                to="/tutor-jobs/$id"
                params={{ id: app.requirementId }}
                className="font-semibold hover:text-primary"
              >
                {app.requirementTitle}
              </Link>
              <p className="mt-1 text-xs text-muted-foreground">
                Applied {new Date(app.createdAt).toLocaleDateString()} ·{" "}
                {formatPrice(app.proposedRate, app.currency)}/hr · {app.sessions} session
                {app.sessions === 1 ? "" : "s"}
              </p>
            </div>
            <Badge className={STATUS_CLASS[app.status] ?? ""}>{app.status}</Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{app.message}</p>
          {app.status === "approved" && (
            <p className="mt-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
              You have been assigned to this role. Check your email for details.
            </p>
          )}
          {app.status === "rejected" && app.adminRemark && (
            <p className="mt-2 text-xs text-muted-foreground">Note: {app.adminRemark}</p>
          )}
        </div>
      ))}
    </div>
  );
}
