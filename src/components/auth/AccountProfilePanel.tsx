"use client";

import { useEffect, useState } from "react";
import { Link } from "@/lib/navigation";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileAvatarUpload } from "@/components/ProfileAvatarUpload";
import { useApp } from "@/hooks/use-app";
import { TEACHER_ONBOARDING_PATH } from "@/lib/auth-redirect";
import { formatApiErrorMessage } from "@/lib/api";
import { toast } from "sonner";

type AccountProfilePanelProps = {
  role: "student" | "teacher" | "parent";
};

export function AccountProfilePanel({ role }: AccountProfilePanelProps) {
  const { user, updateProfile } = useApp();
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setAvatarUrl(user?.avatarUrl || "");
  }, [user?.avatarUrl]);

  const persistAvatar = async (url: string) => {
    setSaving(true);
    try {
      await updateProfile({ avatarUrl: url || "" });
      toast.success("Profile photo saved");
    } catch (err) {
      toast.error(formatApiErrorMessage(err, "Could not save profile photo"));
    } finally {
      setSaving(false);
    }
  };

  const roleHint =
    role === "teacher"
      ? "Shown on the tutor directory, your public profile, and job applications."
      : role === "parent"
        ? "Shown when you message tutors and manage your child's learning."
        : "Shown on your student profile and when you message tutors.";

  const editProfileTo =
    role === "teacher" ? TEACHER_ONBOARDING_PATH : "/profile";

  if (!user) return null;

  return (
    <div className="bg-card border rounded-2xl p-5 space-y-4">
      <div>
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <User className="h-4 w-4 text-primary" />
          Profile photo
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Upload or change your photo. Images are stored on Cloudinary.
        </p>
      </div>

      <ProfileAvatarUpload
        embedded
        inputId={`${role}-dashboard-avatar`}
        name={user.name}
        avatarUrl={avatarUrl}
        uploading={uploadingAvatar || saving}
        onUploadingChange={setUploadingAvatar}
        onAvatarChange={(url) => {
          setAvatarUrl(url);
          void persistAvatar(url);
        }}
        hint={roleHint}
      />

      <div className="flex flex-wrap gap-2 border-t pt-4">
        <Button variant="outline" size="sm" asChild>
          <Link to={editProfileTo}>Edit full profile</Link>
        </Button>
      </div>
    </div>
  );
}
