"use client";

import { useState } from "react";
import { Briefcase, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PermissionGate } from "@/components/admin/Panels";
import {
  useAdminJobApplications,
  useApproveJobApplicationAdmin,
  useRejectJobApplicationAdmin,
} from "@/hooks/use-proposals-api";
import { formatPrice } from "@/lib/currencies";
import { formatApiErrorMessage } from "@/lib/api";
import { toast } from "sonner";

const STATUS_CLASS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

export function JobApplicationsApprovalPanel() {
  const [status, setStatus] = useState("pending");
  const [q, setQ] = useState("");
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("Another tutor was selected for this role");

  const { data: items = [], isLoading } = useAdminJobApplications(status, q);
  const approveMut = useApproveJobApplicationAdmin();
  const rejectMut = useRejectJobApplicationAdmin();

  const handleApprove = async (id: string) => {
    try {
      const result = await approveMut.mutateAsync({ id, adminRemark: "Approved for assignment" });
      toast.success(
        result.emailSent
          ? "Approved — tutor notified by email"
          : "Approved — tutor can see this in their dashboard",
      );
    } catch (err) {
      toast.error(formatApiErrorMessage(err, "Could not approve"));
    }
  };

  const handleReject = async () => {
    if (!rejectId || rejectNote.trim().length < 3) {
      toast.error("Enter a rejection reason (min 3 characters)");
      return;
    }
    try {
      await rejectMut.mutateAsync({ id: rejectId, adminRemark: rejectNote.trim() });
      toast.success("Application rejected");
      setRejectId(null);
    } catch (err) {
      toast.error(formatApiErrorMessage(err, "Could not reject"));
    }
  };

  return (
    <PermissionGate permission="courses.approve">
      <div className="space-y-5">
        <div>
          <h2 className="font-display font-bold text-lg flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Tutor job applications
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Review tutor applications for approved student jobs. On approve, the tutor is assigned and emailed.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tutor, job, message…"
            className="max-w-xs"
          />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-card border rounded-2xl p-5">
          {isLoading ? (
            <div className="py-10 text-center">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job</TableHead>
                  <TableHead>Tutor</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Review</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No applications in this queue.
                    </TableCell>
                  </TableRow>
                )}
                {items.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <div className="font-medium">{app.requirementTitle}</div>
                      <div className="text-xs text-muted-foreground">{new Date(app.createdAt).toLocaleDateString()}</div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {app.teacherName}
                      <div className="text-xs text-muted-foreground">{app.teacherEmail}</div>
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap">
                      {formatPrice(app.proposedRate, app.currency)}/hr · {app.sessions} sess.
                    </TableCell>
                    <TableCell className="max-w-[220px] text-xs text-muted-foreground line-clamp-3">
                      {app.message}
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_CLASS[app.status] ?? ""}>{app.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {app.status === "pending" ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={rejectMut.isPending}
                            onClick={() => {
                              setRejectId(app.id);
                              setRejectNote("Another tutor was selected for this role");
                            }}
                          >
                            <XCircle className="h-4 w-4" /> Reject
                          </Button>
                          <Button
                            size="sm"
                            className="ml-2"
                            disabled={approveMut.isPending}
                            onClick={() => void handleApprove(app.id)}
                          >
                            <CheckCircle2 className="h-4 w-4" /> Approve
                          </Button>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {rejectId && (
          <div className="bg-card border rounded-2xl p-5">
            <h3 className="font-display font-bold mb-3">Reject application</h3>
            <Textarea
              rows={3}
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              maxLength={500}
            />
            <div className="mt-3 flex gap-2">
              <Button variant="outline" onClick={() => setRejectId(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => void handleReject()} disabled={rejectMut.isPending}>
                Confirm reject
              </Button>
            </div>
          </div>
        )}
      </div>
    </PermissionGate>
  );
}
