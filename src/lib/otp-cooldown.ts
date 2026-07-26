import { ApiRequestError } from "@/lib/api";

export type OtpCooldown = {
  /**
   * `resend` — a code was already sent and is still valid, the user just has to
   * wait before asking for a new one.
   * `lockout` — too many failed attempts; the number is blocked for a while.
   */
  kind: "resend" | "lockout";
  /** Seconds to wait before another request is accepted. */
  seconds: number;
  /** Backend message, e.g. "Please wait 47 seconds before requesting another OTP". */
  message: string;
};

/** "wait 47 seconds", "wait 12s", "wait 1 second" */
const SECONDS_RE = /wait\s+(\d+)\s*(?:s\b|secs?\b|seconds?\b)/i;
/** "Try again in 15 minutes" */
const MINUTES_RE = /(\d+)\s*(?:m\b|mins?\b|minutes?\b)/i;

const DEFAULT_LOCKOUT_SECONDS = 60;
const MAX_COOLDOWN_SECONDS = 60 * 60;

function clamp(seconds: number, fallback: number): number {
  const value = Number.isFinite(seconds) ? seconds : fallback;
  return Math.min(MAX_COOLDOWN_SECONDS, Math.max(1, Math.round(value)));
}

/**
 * Rate-limited OTP requests are expected, not failures. Returns the wait time so
 * the UI can show a countdown instead of a dead-end error.
 */
export function parseOtpCooldown(err: unknown): OtpCooldown | null {
  const status = err instanceof ApiRequestError ? err.status : 0;
  const message = err instanceof Error ? err.message.trim() : "";

  const seconds = SECONDS_RE.exec(message);
  if (seconds) {
    return { kind: "resend", seconds: clamp(Number(seconds[1]), 60), message };
  }

  if (status !== 429) return null;

  const minutes = MINUTES_RE.exec(message);
  return {
    kind: "lockout",
    seconds: minutes
      ? clamp(Number(minutes[1]) * 60, DEFAULT_LOCKOUT_SECONDS)
      : DEFAULT_LOCKOUT_SECONDS,
    message: message || "Too many requests. Please try again in a little while.",
  };
}

/** "47s" / "2m 05s" for countdown labels. */
export function formatCooldown(seconds: number): string {
  if (seconds <= 0) return "";
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return rest ? `${mins}m ${String(rest).padStart(2, "0")}s` : `${mins}m`;
}
