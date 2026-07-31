"use client";

import { useState } from "react";
import { Handshake, CheckCircle2, XCircle, Loader2, MessageSquare } from "lucide-react";
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
  useAdminConnectionDetail,
  useAdminConnections,
  useApproveConnectionAdmin,
  useRejectConnectionAdmin,
} from "@/hooks/use-connections-api";
import { formatPrice } from "@/lib/currencies";
import { formatApiErrorMessage } from "@/lib/api";
import { connectionStatusLabel } from "@/lib/payment-status";
import { toast } from "sonner";

const STATUS_CLASS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  approved: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
  connected: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

export function ConnectionRequestsPanel() {
  const [status, setStatus] = useState("pending");
  const [q, setQ] = useState("");
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("Request does not meet platform guidelines");
  const [detailId, setDetailId] = useState<string | null>(null);

  const { data: items = [], isLoading } = useAdminConnections(status, q);
  const { data: detail, isLoading: detailLoading } = useAdminConnectionDetail(detailId);
  const approveMut = useApproveConnectionAdmin();
  const rejectMut = useRejectConnectionAdmin();

  const handleApprove = async (id: string) => {
    try {
      const result = await approveMut.mutateAsync({ id, adminRemark: "Approved for connection" });
      const emailed =
        result.teacherEmailSent || result.learnerEmailSent || result.emailSent
          ? " — student & tutor emailed"
          : "";
      toast.success(`Approved${emailed}. Learner must pay to unlock full contact.`);
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
      toast.success("Connection rejected");
      setRejectId(null);
    } catch (err) {
      toast.error(formatApiErrorMessage(err, "Could not reject"));
    }
  };

  return (
    <PermissionGate permission="courses.approve">
      <div className="space-y-5">
        <div>
          <h2 className="flex items-center gap-2 font-display text-lg font-bold">
            <Handshake className="h-5 w-5 text-primary" />
            Tutor connection requests
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Students/parents request to message, call, or hire a tutor. Approve to notify both
            parties; full chat &amp; phone unlock only after the learner pays the tutor fee.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search learner, tutor…"
            className="max-w-xs"
          />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved (awaiting pay)</SelectItem>
              <SelectItem value="connected">Connected (paid)</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-2xl border bg-card p-5">
          {isLoading ? (
            <div className="py-10 text-center">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No connection requests.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Learner</TableHead>
                  <TableHead>Tutor</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Msgs</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <div className="font-medium">{row.learnerName}</div>
                      <div className="text-xs capitalize text-muted-foreground">{row.learnerRole}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{row.teacherName}</div>
                      <div className="text-xs text-muted-foreground">{row.teacherEmail}</div>
                    </TableCell>
                    <TableCell className="capitalize">{row.source || "—"}</TableCell>
                    <TableCell>
                      {row.learnerMessageCount ?? 0}/{row.maxLimitedMessages ?? 2}
                    </TableCell>
                    <TableCell>
                      {row.amount
                        ? formatPrice(row.amount, row.currency || "INR")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_CLASS[row.status] || ""} variant="outline">
                        {connectionStatusLabel(row.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {row.contactUnlocked ? row.phone || "unlocked" : row.phoneMasked || "—"}
                    </TableCell>
                    <TableCell className="space-x-1 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDetailId(row.id)}
                        title="View conversation"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      {row.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            disabled={approveMut.isPending}
                            onClick={() => void handleApprove(row.id)}
                          >
                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setRejectId(row.id);
                              setRejectNote("Request does not meet platform guidelines");
                            }}
                          >
                            <XCircle className="mr-1 h-3.5 w-3.5" />
                            Reject
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {rejectId && (
          <div className="space-y-3 rounded-2xl border border-destructive/30 bg-card p-5">
            <h3 className="font-semibold">Reject connection</h3>
            <Textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2">
              <Button variant="destructive" disabled={rejectMut.isPending} onClick={() => void handleReject()}>
                Confirm reject
              </Button>
              <Button variant="ghost" onClick={() => setRejectId(null)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {detailId && (
          <div className="space-y-3 rounded-2xl border bg-card p-5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold">Conversation preview</h3>
              <Button size="sm" variant="ghost" onClick={() => setDetailId(null)}>
                Close
              </Button>
            </div>
            {detailLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  {detail?.learnerName} ↔ {detail?.teacherName} · status{" "}
                  <strong>{detail?.status}</strong>
                  {detail?.phoneMasked ? ` · phone ${detail.phoneMasked}` : ""}
                </p>
                <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl bg-muted/30 p-3">
                  {(detail?.messages || []).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No messages yet.</p>
                  ) : (
                    detail?.messages?.map((m) => (
                      <div key={m.id} className="rounded-lg border bg-background px-3 py-2 text-sm">
                        <div className="text-[10px] text-muted-foreground">
                          {m.senderId === detail.learnerId ? "Learner" : "Tutor"} ·{" "}
                          {m.createdAt ? new Date(m.createdAt).toLocaleString() : ""}
                        </div>
                        <div>{m.text}</div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </PermissionGate>
  );
}
