"use client";

import Image from "next/image";
import logoLight from "@/assets/teacherspoints-logo.png";
import logoDark from "@/assets/teacherspoints-logo-dark.png";
import { cn } from "@/lib/utils";

const sizeClass = {
  header: "h-14 sm:h-16 w-auto max-w-[14rem] sm:max-w-[17rem]",
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
 * Dark mode  → teacherspoints-logo-dark.png (white text / dark-background variant)
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
  const imgClass = cn("object-contain object-left shrink-0", sizeClass[size], className);
  const { w, h } = sizePx[size];

  return (
    <>
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
      <Image
        src={logoDark}
        alt="TeacherPoint"
        width={w}
        height={h}
        priority={priority}
        sizes="(max-width: 640px) 14rem, 17rem"
        className={cn(imgClass, "hidden dark:block")}
      />
    </>
  );
}
