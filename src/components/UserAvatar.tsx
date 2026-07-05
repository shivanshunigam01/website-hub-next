"use client";

import { AppImage } from "@/components/AppImage";
import { cn } from "@/lib/utils";

const SIZE_CLASS = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-xl",
  xl: "h-24 w-24 text-3xl",
} as const;

const SIZE_PX = {
  sm: 32,
  md: 40,
  lg: 64,
  xl: 96,
} as const;

type UserAvatarProps = {
  name: string;
  avatarUrl?: string | null;
  size?: keyof typeof SIZE_CLASS;
  className?: string;
  rounded?: "full" | "2xl";
};

export function UserAvatar({
  name,
  avatarUrl,
  size = "md",
  className,
  rounded = "full",
}: UserAvatarProps) {
  const sizeClass = SIZE_CLASS[size];
  const roundClass = rounded === "2xl" ? "rounded-2xl" : "rounded-full";
  const px = SIZE_PX[size];

  if (avatarUrl?.trim()) {
    return (
      <AppImage
        src={avatarUrl}
        alt={name}
        width={px}
        height={px}
        sizes={`${px}px`}
        className={cn("shrink-0 object-cover object-top", roundClass, sizeClass, className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "grid shrink-0 place-items-center bg-gradient-primary font-bold text-primary-foreground",
        roundClass,
        sizeClass,
        className,
      )}
      aria-hidden={!name}
    >
      {(name || "?").charAt(0).toUpperCase()}
    </div>
  );
}
