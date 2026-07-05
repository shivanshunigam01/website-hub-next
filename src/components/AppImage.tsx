"use client";

import Image, { type StaticImageData } from "next/image";
import { cn } from "@/lib/utils";

const OPTIMIZED_HOSTS = new Set([
  "images.unsplash.com",
  "res.cloudinary.com",
  "api.teacherpoint.org",
]);

function isOptimizableRemote(src: string) {
  try {
    return OPTIMIZED_HOSTS.has(new URL(src).hostname);
  } catch {
    return false;
  }
}

type AppImageProps = {
  src: string | StaticImageData;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  fetchPriority?: "high" | "low" | "auto";
  className?: string;
  loading?: "lazy" | "eager";
  onError?: () => void;
};

export function AppImage({
  src,
  alt,
  width,
  height,
  fill,
  sizes,
  priority,
  fetchPriority,
  className,
  loading,
  onError,
}: AppImageProps) {
  const unoptimized = typeof src === "string" && src.startsWith("http") && !isOptimizableRemote(src);
  const lazy = priority ? undefined : (loading ?? "lazy");

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes ?? "(max-width: 768px) 100vw, 50vw"}
        priority={priority}
        fetchPriority={fetchPriority}
        loading={lazy}
        unoptimized={unoptimized}
        onError={onError}
        className={cn("object-cover", className)}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 400}
      height={height ?? 400}
      sizes={sizes}
      priority={priority}
      fetchPriority={fetchPriority}
      loading={lazy}
      unoptimized={unoptimized}
      onError={onError}
      className={className}
    />
  );
}
