"use client";

import { useCallback, useEffect, useState } from "react";
import { Calendar, Loader2, Plus, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SelectWithOther } from "@/components/ui/SelectWithOther";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { WorkshopStatusBadge } from "@/components/workshops/WorkshopCard";
import { fetchMyWorkshops, requestWorkshop } from "@/services/workshops-api";
import { apiUpload, formatApiErrorMessage } from "@/lib/api";
import type { Workshop, WorkshopMode, WorkshopRequestPayload } from "@/types/workshop";

const CATEGORIES = [
  "Technology",
  "Languages",
  "Exam Prep",
  "Career Skills",
  "Arts & Design",
  "Science",
];

const MODE_OPTIONS = [
  { value: "online", label: "Online" },
  { value: "offline", label: "Offline" },
];

const emptyForm: WorkshopRequestPayload = {
  title: "",
  category: "Technology",
  description: "",
  workshopDate: "",
  startTime: "10:00",
  endTime: "12:00",
  mode: "online",
  modeOther: "",
  meetingLink: "",
  location: "",
  isFree: true,
  price: 0,
  maxStudents: 30,
  imageUrl: "",
};

export function TeacherWorkshopsPanel() {
  const [items, setItems] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<WorkshopRequestPayload>(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchMyWorkshops();
      setItems(data.items);
    } catch (e) {
      toast.error(formatApiErrorMessage(e, "Failed to load workshops"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const update = <K extends keyof WorkshopRequestPayload>(key: K, value: WorkshopRequestPayload[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const submit = async () => {
    if (form.mode === "other" && !form.modeOther?.trim()) {
      toast.error("Please specify the workshop mode");
      return;
    }
    setSubmitting(true);
    try {
      await requestWorkshop({
        ...form,
        price: form.isFree ? 0 : Number(form.price || 0),
        modeOther: form.mode === "other" ? form.modeOther?.trim() : undefined,
        meetingLink: form.mode === "online" ? form.meetingLink : "",
        location: form.mode === "offline" ? form.location : "",
      });
      toast.success("Workshop request submitted for admin approval");
      setOpen(false);
      setForm(emptyForm);
      load();
    } catch (e) {
      toast.error(formatApiErrorMessage(e, "Failed to submit workshop"));
    } finally {
      setSubmitting(false);
    }
  };

  const onBannerUpload = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const result = await apiUpload(file);
      update("imageUrl", result.url);
      toast.success("Banner uploaded");
    } catch (e) {
      toast.error(formatApiErrorMessage(e, "Upload failed"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground max-w-xl">
          Request a workshop for your students. An admin will review and approve it before it appears on
          the public Workshops page.
        </p>
        <Button variant="gradient" onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Request workshop
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading workshops…
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-muted/30 p-10 text-center">
          <Calendar className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <h3 className="mt-3 font-semibold">No workshop requests yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first workshop request to reach more students.
          </p>
          <Button variant="gradient" className="mt-4" onClick={() => setOpen(true)}>
            Request workshop
          </Button>
        </div>
      ) : (
        <div className="rounded-2xl border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Enrolled</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Admin note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((w) => (
                <TableRow key={w.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">{w.title}</TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    {new Date(w.workshopDate).toLocaleDateString()} · {w.startTime}
                  </TableCell>
                  <TableCell className="capitalize text-sm">{w.mode}</TableCell>
                  <TableCell className="text-sm">
                    {w.enrolledStudents}/{w.maxStudents}
                  </TableCell>
                  <TableCell>
                    <WorkshopStatusBadge status={w.status} />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[180px] truncate">
                    {w.status === "rejected" ? w.adminRemark || "—" : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Request a workshop</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="ws-title">Title</Label>
              <Input
                id="ws-title"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="Introduction to Python for beginners"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Category</Label>
              <SelectWithOther
                className="mt-1"
                options={CATEGORIES}
                value={form.category}
                onValueChange={(v) => update("category", v)}
                otherPlaceholder="Enter category"
              />
            </div>
            <div>
              <Label htmlFor="ws-desc">Description</Label>
              <Textarea
                id="ws-desc"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                rows={4}
                className="mt-1"
                placeholder="What students will learn, prerequisites, materials needed…"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="ws-date">Date</Label>
                <Input
                  id="ws-date"
                  type="date"
                  value={form.workshopDate}
                  onChange={(e) => update("workshopDate", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Mode</Label>
                <SelectWithOther
                  mode="enum-other"
                  className="mt-1"
                  options={MODE_OPTIONS}
                  value={form.mode}
                  customValue={form.modeOther || ""}
                  onValueChange={(v) => update("mode", v as WorkshopMode)}
                  onCustomValueChange={(v) => update("modeOther", v)}
                  otherPlaceholder="Describe the mode (e.g. hybrid)"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="ws-start">Start time</Label>
                <Input
                  id="ws-start"
                  type="time"
                  value={form.startTime}
                  onChange={(e) => update("startTime", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="ws-end">End time</Label>
                <Input
                  id="ws-end"
                  type="time"
                  value={form.endTime}
                  onChange={(e) => update("endTime", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            {form.mode === "other" ? null : form.mode === "online" ? (
              <div>
                <Label htmlFor="ws-link">Meeting link</Label>
                <Input
                  id="ws-link"
                  value={form.meetingLink}
                  onChange={(e) => update("meetingLink", e.target.value)}
                  placeholder="https://meet.google.com/…"
                  className="mt-1"
                />
              </div>
            ) : (
              <div>
                <Label htmlFor="ws-loc">Location</Label>
                <Input
                  id="ws-loc"
                  value={form.location}
                  onChange={(e) => update("location", e.target.value)}
                  placeholder="Venue, city"
                  className="mt-1"
                />
              </div>
            )}
            <div className="flex items-center justify-between rounded-xl border p-3">
              <div>
                <Label>Free workshop</Label>
                <p className="text-xs text-muted-foreground">Turn off to set a ticket price</p>
              </div>
              <Switch
                checked={form.isFree}
                onCheckedChange={(v) => update("isFree", v)}
              />
            </div>
            {!form.isFree && (
              <div>
                <Label htmlFor="ws-price">Price (USD)</Label>
                <Input
                  id="ws-price"
                  type="number"
                  min={1}
                  value={form.price || ""}
                  onChange={(e) => update("price", Number(e.target.value))}
                  className="mt-1"
                />
              </div>
            )}
            <div>
              <Label htmlFor="ws-max">Max students</Label>
              <Input
                id="ws-max"
                type="number"
                min={1}
                value={form.maxStudents}
                onChange={(e) => update("maxStudents", Number(e.target.value))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Banner image</Label>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Input
                  value={form.imageUrl}
                  onChange={(e) => update("imageUrl", e.target.value)}
                  placeholder="Image URL or upload"
                />
                <label className="inline-flex cursor-pointer items-center">
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    disabled={uploading}
                    onChange={(e) => onBannerUpload(e.target.files?.[0] ?? null)}
                  />
                  <Button type="button" variant="outline" size="sm" disabled={uploading} tabIndex={-1} asChild>
                    <span>
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                    </span>
                  </Button>
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="gradient" onClick={submit} disabled={submitting}>
              {submitting ? "Submitting…" : "Submit for approval"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
