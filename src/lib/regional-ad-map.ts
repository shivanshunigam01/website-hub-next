import type { RegionalAd } from "@/hooks/use-admin-store";

export type ApiBanner = {
  id: string;
  title?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  imageUrl?: string;
  approvedImage?: string;
  approvedImageUrl?: string;
  videoUrl?: string;
  mediaType?: RegionalAd["mediaType"];
  placement?: RegionalAd["placement"];
  language?: string;
  targetType?: RegionalAd["targetType"];
  targetValue?: string;
  active?: boolean;
  priority?: number;
  createdAt?: string;
  updatedAt?: string;
};

export function mapApiBanner(b: ApiBanner): RegionalAd {
  return {
    id: b.id,
    title: b.title ?? "",
    description: b.description ?? "",
    ctaText: b.ctaText ?? "Learn more",
    ctaLink: b.ctaLink ?? "/courses",
    imageUrl: b.imageUrl,
    approvedImageUrl: b.approvedImageUrl || b.imageUrl,
    videoUrl: b.videoUrl,
    mediaType: b.mediaType ?? "banner",
    placement: b.placement ?? "popup",
    language: b.language ?? "",
    priority: b.priority ?? 1,
    targetType: b.targetType ?? "global",
    targetValue: b.targetValue ?? "",
    active: b.active !== false,
    createdAt: b.createdAt ?? new Date().toISOString(),
  };
}
