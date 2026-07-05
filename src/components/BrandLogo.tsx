"use client";

import logoLight from "@/assets/teacherspoints-logo.png";
import logoDark from "@/assets/teacherspoints-logo-dark.png";
import { cn } from "@/lib/utils";

const sizeClass = {
  header: "h-14 sm:h-16 w-auto max-w-[14rem] sm:max-w-[17rem]",
  footer: "h-12 w-auto max-w-[14rem]",
  login: "h-16 sm:h-[4.5rem] w-auto max-w-[18rem]",
  sidebar: "h-10 w-auto max-w-[10rem]",
} as const;

/**
 * Light mode → teacherspoints-logo.png
 * Dark mode  → teacherspoints-logo-dark.png (white text / dark-background variant)
 */
export function BrandLogo({
  size = "header",
  className,
}: {
  size?: keyof typeof sizeClass;
  className?: string;
}) {
  const imgClass = cn("object-contain object-left shrink-0", sizeClass[size], className);

  return (
    <>
      <img
        src={logoLight.src}
        alt="TeacherPoint"
        className={cn(imgClass, "dark:hidden")}
        decoding="async"
      />
      <img
        src={logoDark.src}
        alt="TeacherPoint"
        className={cn(imgClass, "hidden dark:block")}
        decoding="async"
      />
    </>
  );
}
