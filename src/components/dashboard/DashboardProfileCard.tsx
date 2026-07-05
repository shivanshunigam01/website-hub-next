"use client";

import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/UserAvatar";

type DashboardProfileCardProps = {
  name: string;
  email?: string;
  avatarUrl?: string | null;
  roleLabel: string;
  accountHash?: string;
};

export function DashboardProfileCard({
  name,
  email,
  avatarUrl,
  roleLabel,
  accountHash = "account",
}: DashboardProfileCardProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-4 rounded-2xl border bg-card p-4 shadow-sm">
      <UserAvatar name={name} avatarUrl={avatarUrl} size="lg" rounded="2xl" className="h-20 w-20" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {roleLabel}
        </p>
        <p className="font-display text-lg font-bold truncate">{name}</p>
        {email ? <p className="text-sm text-muted-foreground truncate">{email}</p> : null}
      </div>
      <Button variant="outline" size="sm" className="shrink-0" asChild>
        <a href={`#${accountHash}`}>
          <Camera className="me-2 h-4 w-4" />
          {avatarUrl ? "Change photo" : "Upload photo"}
        </a>
      </Button>
    </div>
  );
}
