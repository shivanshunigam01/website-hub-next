"use client";

import { toast } from "sonner";

type Props = {
  ip?: string | null;
  fallback?: string;
  className?: string;
};

/** Monospace IP with optional click-to-copy. */
export function IpAddressCell({ ip, fallback = "—", className = "" }: Props) {
  const value = ip?.trim() || "";
  if (!value) {
    return <span className={`text-muted-foreground text-xs ${className}`}>{fallback}</span>;
  }

  return (
    <button
      type="button"
      title="Click to copy IP"
      className={`font-mono text-xs text-left hover:text-primary hover:underline ${className}`}
      onClick={() => {
        void navigator.clipboard.writeText(value);
        toast.success(`Copied ${value}`);
      }}
    >
      {value}
    </button>
  );
}

export function UserIpSummary({
  registrationIp,
  lastLoginIp,
  lastLoginAt,
  compact = false,
}: {
  registrationIp?: string | null;
  lastLoginIp?: string | null;
  lastLoginAt?: string | null;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="text-[11px] leading-relaxed text-muted-foreground">
        <span className="text-foreground/80">Reg</span>{" "}
        <IpAddressCell ip={registrationIp} fallback="—" className="inline" />
        <span className="mx-1">·</span>
        <span className="text-foreground/80">Last</span>{" "}
        <IpAddressCell ip={lastLoginIp} fallback="—" className="inline" />
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-muted/30 px-2.5 py-2 text-xs space-y-1 min-w-[140px]">
      <div className="flex flex-wrap items-center gap-1">
        <span className="text-muted-foreground shrink-0">Registration IP</span>
        <IpAddressCell ip={registrationIp} fallback="Not recorded" />
      </div>
      <div className="flex flex-wrap items-center gap-1">
        <span className="text-muted-foreground shrink-0">Last login IP</span>
        <IpAddressCell ip={lastLoginIp} fallback="Not recorded" />
      </div>
      {lastLoginAt && (
        <p className="text-[10px] text-muted-foreground pt-0.5">
          Last login: {new Date(lastLoginAt).toLocaleString()}
        </p>
      )}
    </div>
  );
}

export function IpAddressList({
  users,
}: {
  users: { id: string; name: string; registrationIp?: string; lastLoginIp?: string; lastLoginAt?: string }[];
}) {
  if (!users.length) return <span className="text-xs text-muted-foreground">—</span>;

  return (
    <ul className="space-y-2 max-w-[260px]">
      {users.map((u) => (
        <li key={u.id} className="text-xs leading-snug border-l-2 border-primary/30 pl-2">
          <span className="font-medium text-foreground block mb-0.5">{u.name}</span>
          <UserIpSummary
            registrationIp={u.registrationIp}
            lastLoginIp={u.lastLoginIp}
            lastLoginAt={u.lastLoginAt}
            compact
          />
        </li>
      ))}
    </ul>
  );
}
