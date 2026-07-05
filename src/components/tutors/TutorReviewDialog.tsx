"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Star } from "lucide-react";
import { RatingStars } from "@/components/lms/RatingStars";
import { formatApiErrorMessage } from "@/lib/api";
import { useSubmitReview } from "@/hooks/use-learning";
import { toast } from "sonner";

type TutorReviewDialogProps = {
  tutorId: string;
  tutorName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TutorReviewDialog({ tutorId, tutorName, open, onOpenChange }: TutorReviewDialogProps) {
  const submitReview = useSubmitReview();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    const trimmed = comment.trim();
    if (trimmed.length < 5) {
      toast.error("Please write at least a few words.");
      return;
    }
    setSubmitting(true);
    try {
      await submitReview({ tutorId, targetType: "tutor", rating, text: trimmed.slice(0, 600) });
      setComment("");
      setRating(5);
      onOpenChange(false);
      toast.success("Thanks for your review!");
    } catch (e) {
      toast.error(formatApiErrorMessage(e, "Could not post review"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <Star className="h-5 w-5 text-amber-500" />
            Review {tutorName}
          </DialogTitle>
          <DialogDescription>
            Share your experience to help other students choose the right tutor.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium">Your rating</p>
            <RatingStars value={rating} size={5} onChange={setRating} />
          </div>
          <Textarea
            rows={4}
            placeholder="What was it like learning with this tutor?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={600}
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" size="default" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button size="default" variant="gradient" onClick={submit} disabled={submitting}>
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Post review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
