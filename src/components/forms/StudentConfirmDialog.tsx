"use client";

import { Link } from "@/lib/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinueAsStudent: () => void;
};

export function StudentConfirmDialog({ open, onOpenChange, onContinueAsStudent }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Are you really a student?</DialogTitle>
          <DialogDescription className="text-start text-sm leading-relaxed text-muted-foreground">
            It appears that you are posting here to find students. This page is for students who want
            teachers. If that&apos;s the case, please{" "}
            <Link to="/register" search={{ role: "teacher" }} className="font-medium text-primary hover:underline">
              register
            </Link>{" "}
            as an expert. Otherwise, tutors will contact you thinking that you are a student.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-stretch">
          <Button asChild variant="default" className="w-full sm:w-auto">
            <Link to="/register" search={{ role: "teacher" }}>
              Register as an expert
            </Link>
          </Button>
          <Button
            type="button"
            variant="gradient"
            className="w-full sm:w-auto"
            onClick={() => {
              onContinueAsStudent();
              onOpenChange(false);
            }}
          >
            Continue as a student
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
