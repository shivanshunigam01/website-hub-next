"use client";

import { Camera, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserAvatar } from "@/components/UserAvatar";
import { apiUpload, formatApiErrorMessage } from "@/lib/api";
import { toast } from "sonner";

type ProfileAvatarUploadProps = {
  name: string;
  avatarUrl: string;
  uploading: boolean;
  onUploadingChange: (uploading: boolean) => void;
  onAvatarChange: (url: string) => void;
  hint?: string;
  inputId?: string;
  embedded?: boolean;
};

export function ProfileAvatarUpload({
  name,
  avatarUrl,
  uploading,
  onUploadingChange,
  onAvatarChange,
  hint = "This photo appears on your profile and across the platform.",
  inputId = "avatarUpload",
  embedded = false,
}: ProfileAvatarUploadProps) {
  const wrapperClass = embedded ? "" : "rounded-xl border bg-muted/20 p-4";

  return (
    <div className={wrapperClass}>
      <Label htmlFor={inputId} className="flex items-center gap-1.5">
        <Camera className="h-3.5 w-3.5 text-primary" />
        Profile photo
      </Label>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <UserAvatar
          name={name}
          avatarUrl={avatarUrl}
          size="xl"
          rounded="2xl"
          className="border bg-background"
        />
        <div className="min-w-0 flex-1">
          <Input
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            disabled={uploading}
            onChange={async (event) => {
              const file = event.currentTarget.files?.[0];
              if (!file) return;
              if (file.size > 10 * 1024 * 1024) {
                toast.error("Image must be 10 MB or smaller.");
                return;
              }
              onUploadingChange(true);
              try {
                const uploaded = await apiUpload(file, "avatar");
                if (uploaded.mediaType !== "image") {
                  toast.error("Please upload an image file.");
                  return;
                }
                onAvatarChange(uploaded.url);
                toast.success("Profile photo uploaded to Cloudinary");
              } catch (err) {
                toast.error(formatApiErrorMessage(err, "Could not upload profile photo"));
              } finally {
                onUploadingChange(false);
                event.currentTarget.value = "";
              }
            }}
          />
          <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
          {uploading ? (
            <p className="mt-2 inline-flex items-center gap-2 text-xs text-primary">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Uploading to Cloudinary…
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
