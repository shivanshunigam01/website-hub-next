"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Globe2, MapPin, Plus, Pencil, Trash2, Upload, Film, Loader2 } from "lucide-react";
import { ApprovedImageThumbnail, pickApprovedImageUrl } from "@/components/ui/ApprovedImageThumbnail";
import { api, apiUpload, formatApiErrorMessage } from "@/lib/api";
import { mapApiBanner, type ApiBanner } from "@/lib/regional-ad-map";
import { invalidateRegionalAdsCache } from "@/hooks/use-regional-ads";
import type {
  RegionalAd,
  RegionalAdMedia,
  RegionalAdPlacement,
  RegionalAdTarget,
} from "@/hooks/use-admin-store";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type PaginatedBanners = {
  items: ApiBanner[];
  pagination: { total: number };
};

const defaultForm = (overrides: Partial<RegionalAd> = {}): Partial<RegionalAd> => ({
  title: "New regional content",
  description: "",
  ctaText: "Learn more",
  ctaLink: "/courses",
  mediaType: "image",
  placement: "hero-strip",
  targetType: "global",
  targetValue: "",
  language: "",
  priority: 1,
  active: true,
  ...overrides,
});

const popupDefaults = (): Partial<RegionalAd> =>
  defaultForm({
    title: "Welcome offer",
    description: "Special content for visitors in your target region.",
    placement: "popup",
    targetType: "country",
    targetValue: "",
    priority: 10,
  });

function PreviewThumb({ ad }: { ad: RegionalAd }) {
  if (ad.mediaType === "video" && ad.videoUrl) {
    return (
      <div className="flex h-[60px] w-[60px] items-center justify-center rounded-md border border-border bg-muted">
        <Film className="h-4 w-4 text-muted-foreground" />
      </div>
    );
  }
  return (
    <ApprovedImageThumbnail
      approvedImageUrl={pickApprovedImageUrl(ad)}
      alt={ad.title}
    />
  );
}

export function RegionalContentPanel() {
  const [items, setItems] = useState<RegionalAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<RegionalAd | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { i18n } = useTranslation();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<PaginatedBanners>("/admin/banners?limit=100");
      setItems((data.items ?? []).map(mapApiBanner));
    } catch (e) {
      toast.error(formatApiErrorMessage(e, "Failed to load regional content"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createNew = async (payload: Partial<RegionalAd> = defaultForm()) => {
    setSaving(true);
    try {
      const created = await api<ApiBanner>("/admin/banners", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      invalidateRegionalAdsCache();
      await load();
      const mapped = mapApiBanner(created);
      setEditing(mapped);
      setOpen(true);
      toast.success(
        payload.placement === "popup"
          ? "Location popup created — set country/city and upload media"
          : "Content created — add media and targeting",
      );
    } catch (e) {
      toast.error(formatApiErrorMessage(e, "Could not create content"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await api(`/admin/banners/${id}`, { method: "DELETE" });
      invalidateRegionalAdsCache();
      await load();
      toast.success("Content removed");
    } catch (e) {
      toast.error(formatApiErrorMessage(e, "Delete failed"));
    }
  };

  const toggleActive = async (ad: RegionalAd, active: boolean) => {
    try {
      await api(`/admin/banners/${ad.id}`, {
        method: "PATCH",
        body: JSON.stringify({ active }),
      });
      invalidateRegionalAdsCache();
      setItems((prev) => prev.map((x) => (x.id === ad.id ? { ...x, active } : x)));
    } catch (e) {
      toast.error(formatApiErrorMessage(e, "Update failed"));
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border bg-gradient-to-br from-primary/5 via-card to-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
              <Globe2 className="h-3.5 w-3.5 text-primary" /> Geo CMS — location / IP personalization
            </div>
            <h2 className="font-display font-bold mt-1 text-lg">Manual content upload by location</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              Upload banners and a <strong className="text-foreground">location popup</strong> that appears once when a
              visitor opens the site — only if their detected country or city matches your targeting (e.g.{" "}
              <code className="text-xs">Saudi Arabia</code>, <code className="text-xs">AE</code>,{" "}
              <code className="text-xs">Dubai</code>).
            </p>
          </div>
          <div className="rounded-xl border bg-background/60 px-3 py-2 text-sm">
            <p className="text-[11px] uppercase text-muted-foreground">Active UI language</p>
            <p className="font-semibold uppercase mt-0.5">{i18n.language}</p>
            <p className="text-[11px] text-muted-foreground">Auto from country / manual override</p>
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-display font-bold">Regional content library ({items.length})</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Use <strong className="text-foreground">Location popup</strong> for the one-time welcome modal. Set placement
              to <em>Welcome popup</em>, choose <em>Country</em> or <em>City</em>, and enter the region name or ISO code.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="gradient" onClick={() => createNew(popupDefaults())} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
              New location popup
            </Button>
            <Button size="sm" variant="outline" onClick={() => createNew()} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              New banner
            </Button>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Loading content…</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Preview</TableHead>
                <TableHead>Content</TableHead>
                <TableHead>Media</TableHead>
                <TableHead>Placement</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Lang</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-10">
                    No regional content yet. Click &quot;New content&quot; to add your first banner or ad.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((ad) => (
                  <TableRow key={ad.id}>
                    <TableCell>
                      <PreviewThumb ad={ad} />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{ad.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{ad.description}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {ad.mediaType ?? "image"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {(ad.placement ?? "popup").replace("-", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {ad.targetType === "global" ? "Worldwide" : ad.targetValue}
                      </Badge>
                    </TableCell>
                    <TableCell className="uppercase text-xs">{ad.language || "any"}</TableCell>
                    <TableCell>
                      <Switch checked={ad.active} onCheckedChange={(v) => toggleActive(ad, v)} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditing(ad);
                          setOpen(true);
                        }}
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => remove(ad.id)}
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}

        <ContentEditDialog
          open={open && !!editing}
          ad={editing}
          onClose={() => {
            setOpen(false);
            setEditing(null);
          }}
          onSaved={async () => {
            invalidateRegionalAdsCache();
            await load();
            setOpen(false);
            setEditing(null);
          }}
        />
      </div>
    </div>
  );
}

function ContentEditDialog({
  open,
  ad,
  onClose,
  onSaved,
}: {
  open: boolean;
  ad: RegionalAd | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<Partial<RegionalAd>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const update = <K extends keyof RegionalAd>(k: K, v: RegionalAd[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (ad) setForm({ ...ad });
  }, [ad]);

  if (!ad) return null;

  const handleUpload = async (file: File, kind: "image" | "video") => {
    setUploading(true);
    try {
      const result = await apiUpload(file);
      if (kind === "image") {
        update("imageUrl", result.url);
        update("mediaType", "image");
      } else {
        update("videoUrl", result.url);
        update("mediaType", "video");
      }
      toast.success(`${kind === "image" ? "Image" : "Video"} uploaded`);
    } catch (e) {
      toast.error(formatApiErrorMessage(e, "Upload failed"));
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await api(`/admin/banners/${ad.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          ctaText: form.ctaText,
          ctaLink: form.ctaLink,
          imageUrl: form.imageUrl,
          videoUrl: form.videoUrl,
          mediaType: form.mediaType,
          placement: form.placement,
          language: form.language || "",
          targetType: form.targetType,
          targetValue: form.targetValue,
          priority: form.priority,
          active: form.active,
        }),
      });
      toast.success("Content saved");
      onSaved();
    } catch (e) {
      toast.error(formatApiErrorMessage(e, "Save failed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit regional content</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div>
            <Label>Title</Label>
            <Input value={form.title || ""} onChange={(e) => update("title", e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              rows={3}
              value={form.description || ""}
              onChange={(e) => update("description", e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>CTA button text</Label>
              <Input value={form.ctaText || ""} onChange={(e) => update("ctaText", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>CTA link (path)</Label>
              <Input
                value={form.ctaLink || ""}
                onChange={(e) => update("ctaLink", e.target.value)}
                placeholder="/courses"
                className="mt-1"
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Media type</Label>
              <Select
                value={form.mediaType ?? "image"}
                onValueChange={(v) => update("mediaType", v as RegionalAdMedia)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="banner">Text banner (gradient)</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video (mp4/webm)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Placement</Label>
              <Select
                value={form.placement ?? "popup"}
                onValueChange={(v) => update("placement", v as RegionalAdPlacement)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popup">Location popup (once per visit)</SelectItem>
                  <SelectItem value="hero-strip">Home — under hero</SelectItem>
                  <SelectItem value="inline-banner">Home — inline banner</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-xl border p-4 space-y-3 bg-muted/30">
            <Label className="text-base font-semibold">Upload media</Label>
            <p className="text-xs text-muted-foreground">
              Images and videos are stored on the server (max size per your backend config).
            </p>
            <div className="flex flex-wrap gap-2">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUpload(f, "image");
                  e.target.value = "";
                }}
              />
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUpload(f, "video");
                  e.target.value = "";
                }}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={uploading}
                onClick={() => imageInputRef.current?.click()}
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Upload image
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={uploading}
                onClick={() => videoInputRef.current?.click()}
              >
                <Film className="h-4 w-4" /> Upload video
              </Button>
            </div>
            {form.imageUrl && form.mediaType !== "video" && (
              <img src={form.imageUrl} alt="" className="mt-2 max-h-32 rounded-lg border object-cover" />
            )}
            {form.videoUrl && form.mediaType === "video" && (
              <video src={form.videoUrl} controls className="mt-2 max-h-40 w-full rounded-lg border" />
            )}
          </div>

          <div>
            <Label>Image URL {form.mediaType === "image" ? "(required for image ads)" : "(optional)"}</Label>
            <Input
              value={form.imageUrl || ""}
              onChange={(e) => update("imageUrl", e.target.value)}
              placeholder="https://... or upload above"
              className="mt-1"
            />
          </div>
          {form.mediaType === "video" && (
            <div>
              <Label>Video URL (mp4 / webm)</Label>
              <Input
                value={form.videoUrl || ""}
                onChange={(e) => update("videoUrl", e.target.value)}
                placeholder="Upload above or paste CDN URL"
                className="mt-1"
              />
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Show to</Label>
              <Select
                value={form.targetType}
                onValueChange={(v) => update("targetType", v as RegionalAdTarget)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">Everyone (worldwide)</SelectItem>
                  <SelectItem value="country">Country</SelectItem>
                  <SelectItem value="city">City</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{form.targetType === "global" ? "Note" : "Country or city name"}</Label>
              <Input
                value={form.targetValue || ""}
                onChange={(e) => update("targetValue", e.target.value)}
                disabled={form.targetType === "global"}
                placeholder={
                  form.targetType === "city"
                    ? "Dubai, Riyadh, Mumbai…"
                    : "Saudi Arabia, AE, IN…"
                }
                className="mt-1"
              />
              {form.placement === "popup" && form.targetType === "global" && (
                <p className="mt-1.5 text-xs text-amber-700 dark:text-amber-300">
                  Location popups only appear for country or city targeting — not worldwide.
                </p>
              )}
              {form.placement === "popup" && form.targetType !== "global" && (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Popup shows once per visit when the visitor&apos;s detected {form.targetType} matches this value.
                </p>
              )}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Language (optional)</Label>
              <Select
                value={form.language || "any"}
                onValueChange={(v) => update("language", v === "any" ? "" : v)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any language</SelectItem>
                  <SelectItem value="en">English (en)</SelectItem>
                  <SelectItem value="hi">हिन्दी (hi)</SelectItem>
                  <SelectItem value="ar">العربية (ar)</SelectItem>
                  <SelectItem value="es">Español (es)</SelectItem>
                  <SelectItem value="fr">Français (fr)</SelectItem>
                  <SelectItem value="de">Deutsch (de)</SelectItem>
                  <SelectItem value="it">Italiano (it)</SelectItem>
                  <SelectItem value="zh">中文 (zh)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority (higher = shown first)</Label>
              <Input
                type="number"
                value={form.priority ?? 1}
                onChange={(e) => update("priority", Number(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label htmlFor="ad-active">Active (visible to visitors)</Label>
            <Switch
              id="ad-active"
              checked={form.active ?? true}
              onCheckedChange={(v) => update("active", v)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
