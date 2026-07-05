"use client";

import { memo, useCallback, useState } from "react";
import { ImageIcon } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const THUMB_CLASS =
  "h-[60px] w-[60px] shrink-0 rounded-md border border-border object-cover";

type Props = {
  approvedImageUrl?: string | null;
  alt?: string;
  className?: string;
};

export const ApprovedImageThumbnail = memo(function ApprovedImageThumbnail({
  approvedImageUrl,
  alt = "",
  className = THUMB_CLASS,
}: Props) {
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const src = approvedImageUrl?.trim();

  const handleError = useCallback(() => setFailed(true), []);
  const handleOpen = useCallback(() => {
    if (src && !failed) setOpen(true);
  }, [src, failed]);

  if (!src) {
    return (
      <div
        className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-md border border-border bg-muted text-[11px] text-muted-foreground"
        aria-label="No image"
      >
        No Image
      </div>
    );
  }

  if (failed) {
    return (
      <div
        className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-md border border-border bg-muted"
        aria-label="Image unavailable"
      >
        <ImageIcon className="h-5 w-5 text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={alt ? `View image: ${alt}` : "View full image"}
      >
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={handleError}
          className={className}
        />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl border-none bg-transparent p-2 shadow-none">
          <img
            src={src}
            alt={alt}
            className="max-h-[85vh] w-full rounded-lg object-contain"
          />
        </DialogContent>
      </Dialog>
    </>
  );
});

/** Prefer API-provided approvedImageUrl; fall back to imageUrl for legacy/local data. */
export function pickApprovedImageUrl(
  item?: { approvedImageUrl?: string | null; imageUrl?: string | null } | null,
): string | undefined {
  return item?.approvedImageUrl?.trim() || item?.imageUrl?.trim() || undefined;
}
