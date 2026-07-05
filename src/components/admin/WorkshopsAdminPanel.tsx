"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Eye, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { WorkshopStatusBadge } from "@/components/workshops/WorkshopCard";
import { ApprovedImageThumbnail, pickApprovedImageUrl } from "@/components/ui/ApprovedImageThumbnail";
import {
  approveWorkshop,
  fetchAdminWorkshopDetail,
  fetchAdminWorkshops,
  rejectWorkshop,
  updateWorkshopStatus,
} from "@/services/workshops-api";
import { formatApiErrorMessage } from "@/lib/api";
import type { Workshop, WorkshopDetail } from "@/types/workshop";

const FILTERS = ["all", "pending", "approved", "rejected", "inactive"] as const;

export function WorkshopsAdminPanel() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("pending");
  const [items, setItems] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<WorkshopDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<Workshop | null>(null);
  const [remark, setRemark] = useState("");
  const [confirmApprove, setConfirmApprove] = useState<Workshop | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdminWorkshops(filter === "all" ? undefined : filter);
      setItems(data.items);
    } catch (e) {
      toast.error(formatApiErrorMessage(e, "Failed to load workshops"));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const openDetail = async (w: Workshop) => {
    try {
      const data = await fetchAdminWorkshopDetail(w.id);
      setDetail(data);
      setDetailOpen(true);
    } catch (e) {
      toast.error(formatApiErrorMessage(e, "Failed to load details"));
    }
  };

  const doApprove = async () => {
    if (!confirmApprove) return;
    setBusy(true);
    try {
      await approveWorkshop(confirmApprove.id);
      toast.success("Workshop approved");
      setConfirmApprove(null);
      load();
    } catch (e) {
      toast.error(formatApiErrorMessage(e, "Approve failed"));
    } finally {
      setBusy(false);
    }
  };

  const doReject = async () => {
    if (!rejectTarget || remark.trim().length < 3) {
      toast.error("Please enter a rejection reason (min 3 characters)");
      return;
    }
    setBusy(true);
    try {
      await rejectWorkshop(rejectTarget.id, remark.trim());
      toast.success("Workshop rejected");
      setRejectOpen(false);
      setRejectTarget(null);
      setRemark("");
      load();
    } catch (e) {
      toast.error(formatApiErrorMessage(e, "Reject failed"));
    } finally {
      setBusy(false);
    }
  };

  const toggleInactive = async (w: Workshop) => {
    const next = w.status === "inactive" ? "approved" : "inactive";
    const label = next === "inactive" ? "deactivate" : "reactivate";
    if (!window.confirm(`Are you sure you want to ${label} "${w.title}"?`)) return;
    setBusy(true);
    try {
      await updateWorkshopStatus(w.id, next);
      toast.success(next === "inactive" ? "Workshop marked inactive" : "Workshop reactivated");
      load();
    } catch (e) {
      toast.error(formatApiErrorMessage(e, "Status update failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? "default" : "outline"}
            className="capitalize"
            onClick={() => setFilter(f)}
          >
            {f}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          No workshop requests in this filter.
        </div>
      ) : (
        <div className="rounded-2xl border bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[72px]">Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((w) => (
                <TableRow key={w.id}>
                  <TableCell>
                    <ApprovedImageThumbnail
                      approvedImageUrl={pickApprovedImageUrl(w)}
                      alt={w.title}
                    />
                  </TableCell>
                  <TableCell className="font-medium max-w-[160px] truncate">{w.title}</TableCell>
                  <TableCell className="text-sm">{w.teacherName}</TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    {new Date(w.workshopDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <WorkshopStatusBadge status={w.status} />
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button size="sm" variant="ghost" onClick={() => openDetail(w)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    {w.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-emerald-600"
                          disabled={busy}
                          onClick={() => setConfirmApprove(w)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive"
                          disabled={busy}
                          onClick={() => {
                            setRejectTarget(w);
                            setRemark("");
                            setRejectOpen(true);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {(w.status === "approved" || w.status === "inactive") && (
                      <Button size="sm" variant="outline" disabled={busy} onClick={() => toggleInactive(w)}>
                        {w.status === "inactive" ? "Activate" : "Deactivate"}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{detail?.title}</DialogTitle>
          </DialogHeader>
              {detail && (
            <div className="space-y-3 text-sm">
              <ApprovedImageThumbnail
                approvedImageUrl={pickApprovedImageUrl(detail)}
                alt={detail.title}
                className="h-40 w-full max-w-sm rounded-lg border border-border object-cover"
              />
              <div className="flex flex-wrap gap-2">
                <WorkshopStatusBadge status={detail.status} />
                <Badge variant="outline" className="capitalize">{detail.mode}</Badge>
                <Badge variant="outline">{detail.category}</Badge>
              </div>
              <p className="text-muted-foreground">{detail.description}</p>
              <p>
                <strong>Teacher:</strong> {detail.teacherName}
              </p>
              <p>
                <strong>Schedule:</strong>{" "}
                {new Date(detail.workshopDate).toLocaleDateString()} · {detail.startTime}–
                {detail.endTime}
              </p>
              <p>
                <strong>Capacity:</strong> {detail.enrolledStudents}/{detail.maxStudents}
              </p>
              {detail.mode === "online" ? (
                <p>
                  <strong>Link:</strong> {detail.meetingLink || "—"}
                </p>
              ) : (
                <p>
                  <strong>Location:</strong> {detail.location || "—"}
                </p>
              )}
              {detail.adminRemark && (
                <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-2 text-destructive">
                  <strong>Admin remark:</strong> {detail.adminRemark}
                </p>
              )}
              {detail.registrations && detail.registrations.length > 0 && (
                <div>
                  <strong>Registrations ({detail.registrations.length})</strong>
                  <ul className="mt-1 max-h-32 overflow-y-auto text-xs text-muted-foreground">
                    {detail.registrations.map((r) => (
                      <li key={r.id}>
                        {r.studentName} · {r.studentEmail}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmApprove} onOpenChange={(o) => !o && setConfirmApprove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve workshop?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{confirmApprove?.title}&rdquo; will become visible on the public Workshops page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={doApprove} disabled={busy}>
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject workshop</DialogTitle>
          </DialogHeader>
          <div>
            <Label htmlFor="remark">Reason for rejection</Label>
            <Textarea
              id="remark"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              rows={3}
              className="mt-1"
              placeholder="Explain what the teacher should change…"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={doReject} disabled={busy}>
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
