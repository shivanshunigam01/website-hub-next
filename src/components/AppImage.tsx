"use client";

import Image, { type StaticImageData } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { resolveAssetUrl } from "@/lib/api-origin";

const OPTIMIZED_HOSTS = new Set([
  "images.unsplash.com",
  "res.cloudinary.com",
  "api.teacherpoint.org",
  "api.teacherpoint.in",
  "localhost",
  "127.0.0.1",
]);

function isOptimizableRemote(src: string) {
  try {
    const { hostname, protocol } = new URL(src);
    if (protocol === "http:" && (hostname === "localhost" || hostname === "127.0.0.1")) {
      return true;
    }
    return OPTIMIZED_HOSTS.has(hostname);
  } catch {
    // Local / relative paths are handled by Next
    return true;
  }
}

function normalizeSrc(src: string | StaticImageData): string | StaticImageData {
  if (typeof src !== "string") return src;
  if (/^(https?:|data:|blob:)/i.test(src)) return src;
  // Keep Next.js public assets as-is; only resolve API-relative upload paths
  if (src.startsWith("/") && !src.startsWith("/uploads")) return src;
  return resolveAssetUrl(src) ?? src;
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
  /** Shown when the remote image fails to load. */
  fallbackSrc?: string;
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
  fallbackSrc,
}: AppImageProps) {
  const [failed, setFailed] = useState(false);
  const resolved = normalizeSrc(src);
  const activeSrc =
    failed && fallbackSrc ? fallbackSrc : failed ? undefined : resolved;

  if (!activeSrc) {
    return (
      <div
        className={cn(
          fill ? "absolute inset-0" : "",
          "bg-muted",
          className,
        )}
        style={!fill ? { width: width ?? 400, height: height ?? 400 } : undefined}
        role="img"
        aria-label={alt}
      />
    );
  }

  const unoptimized =
    typeof activeSrc === "string" &&
    activeSrc.startsWith("http") &&
    !isOptimizableRemote(activeSrc);
  const lazy = priority ? undefined : (loading ?? "lazy");

  const handleError = () => {
    setFailed(true);
    onError?.();
  };

  if (fill) {
    return (
      <Image
        src={activeSrc}
        alt={alt}
        fill
        sizes={sizes ?? "(max-width: 768px) 100vw, 50vw"}
        priority={priority}
        fetchPriority={fetchPriority}
        loading={lazy}
        unoptimized={unoptimized}
        onError={handleError}
        className={cn("object-cover", className)}
      />
    );
  }

  return (
    <Image
      src={activeSrc}
      alt={alt}
      width={width ?? 400}
      height={height ?? 400}
      sizes={sizes}
      priority={priority}
      fetchPriority={fetchPriority}
      loading={lazy}
      unoptimized={unoptimized}
      onError={handleError}
      className={className}
    />
  );
}
