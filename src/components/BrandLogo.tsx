"use client";

import Image from "next/image";
import logoLight from "@/assets/teacherspoints-logo.png";
import logoDark from "@/assets/teacherspoints-logo-dark.webp";
import { cn } from "@/lib/utils";

const sizeClass = {
  header: "h-12 sm:h-14 w-auto max-w-[11rem] sm:max-w-[14rem] xl:h-16 xl:max-w-[16rem]",
  footer: "h-12 w-auto max-w-[14rem]",
  login: "h-16 sm:h-[4.5rem] w-auto max-w-[18rem]",
  sidebar: "h-10 w-auto max-w-[10rem]",
} as const;

const sizePx = {
  header: { w: 272, h: 64 },
  footer: { w: 224, h: 48 },
  login: { w: 288, h: 72 },
  sidebar: { w: 160, h: 40 },
} as const;

/**
 * Light mode → teacherspoints-logo.png
 * Dark mode  → teacherspoints-logo-dark.webp (white text / dark-background variant)
 */
export function BrandLogo({
  size = "header",
  className,
  priority = false,
}: {
  size?: keyof typeof sizeClass;
  className?: string;
  priority?: boolean;
}) {
  // Keep responsive/layout classes on the wrapper so they never fight theme
  // visibility (`dark:hidden` / `hidden dark:block`) on the images.
  const imgClass = cn("object-contain object-left shrink-0", sizeClass[size]);
  const { w, h } = sizePx[size];

  return (
    <span className={cn("relative inline-flex shrink-0 items-center", className)}>
      <Image
        src={logoLight}
        alt="TeacherPoint"
        width={w}
        height={h}
        priority={priority}
        fetchPriority={priority ? "high" : undefined}
        sizes="(max-width: 640px) 14rem, 17rem"
        className={cn(imgClass, "dark:hidden")}
      />
      {/* Absolutely stacked so light+dark never sit side-by-side if theme CSS lags */}
      <Image
        src={logoDark}
        alt=""
        aria-hidden
        width={w}
        height={h}
        loading="lazy"
        sizes="(max-width: 640px) 14rem, 17rem"
        className={cn(imgClass, "pointer-events-none absolute inset-0 hidden dark:block")}
      />
    </span>
  );
}
