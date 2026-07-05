"use client";

import { Star } from "lucide-react";

export function RatingStars({
  value,
  size = 4,
  onChange,
}: {
  value: number;
  size?: number;
  onChange?: (n: number) => void;
}) {
  const cls = `h-${size} w-${size}`;
  return (
    <div className={`inline-flex items-center gap-0.5 ${onChange ? "cursor-pointer" : ""}`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= Math.round(value);
        return (
          <button
            key={n}
            type="button"
            disabled={!onChange}
            onClick={() => onChange?.(n)}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            className={onChange ? "transition hover:scale-110" : ""}
          >
            <Star
              className={`${cls} ${filled ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`}
            />
          </button>
        );
      })}
    </div>
  );
}
