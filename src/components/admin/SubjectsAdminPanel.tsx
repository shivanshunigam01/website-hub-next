"use client";

import { useCallback, useEffect, useState } from "react";
import { GraduationCap, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatApiErrorMessage } from "@/lib/api";
import {
  fetchAdminSubjects,
  updateSubjectStatus,
  type SubjectItem,
} from "@/services/subjects-api";
import { invalidateSubjectCatalog } from "@/hooks/use-subject-catalog";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const GROUPS = [
  "academic",
  "language",
  "programming",
  "engineering",
  "business",
  "arts",
  "exam",
  "professional",
  "humanities",
  "medical",
  "law",
  "sports",
  "other",
] as const;

export function SubjectsAdminPanel() {
  const queryClient = useQueryClient();
  const [items, setItems] = useState<SubjectItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [approval, setApproval] = useState<"all" | "pending" | "approved">("all");
  const [group, setGroup] = useState<string>("all");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQ(q), 300);
    return () => window.clearTimeout(t);
  }, [q]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdminSubjects({
        q: debouncedQ,
        status,
        approval,
        group: group === "all" ? undefined : group,
        limit: 100,
        page: 1,
      });
      setItems(data.items ?? []);
      setTotal(data.pagination?.total ?? data.items?.length ?? 0);
    } catch (err) {
      toast.error(formatApiErrorMessage(err, "Failed to load subjects"));
    } finally {
      setLoading(false);
    }
  }, [debouncedQ, status, approval, group]);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggleActive(item: SubjectItem, isActive: boolean) {
    setTogglingId(item.id);
    try {
      await updateSubjectStatus(item.id, isActive);
      invalidateSubjectCatalog(queryClient);
      setItems((prev) => prev.map((row) => (row.id === item.id ? { ...row, isActive } : row)));
      toast.success(isActive ? `"${item.name}" enabled` : `"${item.name}" disabled`);
    } catch (err) {
      toast.error(formatApiErrorMessage(err, "Could not update subject"));
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Subjects & skills
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Control which subjects appear in search and tutor filters. Disabled subjects stay in the database but are hidden from the public API.
          </p>
        </div>
        <Badge variant="secondary">{total} total</Badge>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[220px] flex-1 max-w-md">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search subjects…"
            className="ps-10"
          />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Disabled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={approval} onValueChange={(v) => setApproval(v as typeof approval)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Approval" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All approval</SelectItem>
            <SelectItem value="pending">Pending approval</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
          </SelectContent>
        </Select>
        <Select value={group} onValueChange={setGroup}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All groups</SelectItem>
            {GROUPS.map((g) => (
              <SelectItem key={g} value={g}>
                {g}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => void load()} disabled={loading}>
          Refresh
        </Button>
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject</TableHead>
              <TableHead>Group</TableHead>
              <TableHead>Popular</TableHead>
              <TableHead className="text-end">Shown in search</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  No subjects match your filters.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="font-medium flex flex-wrap items-center gap-2">
                      {item.name}
                      {item.approvalStatus === "pending" || item.isActive === false ? (
                        <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                          Pending
                        </Badge>
                      ) : null}
                    </div>
                    <div className="text-xs text-muted-foreground">{item.slug}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {item.group}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.isPopular ? "Yes" : "—"}</TableCell>
                  <TableCell className="text-end">
                    <div className="inline-flex items-center gap-2">
                      <Label htmlFor={`subject-active-${item.id}`} className="sr-only">
                        Enable {item.name}
                      </Label>
                      <Switch
                        id={`subject-active-${item.id}`}
                        checked={item.isActive !== false}
                        disabled={togglingId === item.id}
                        onCheckedChange={(checked) => void toggleActive(item, checked)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
