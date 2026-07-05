"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Network,
  Users,
  AlertTriangle,
  Calendar,
  Loader2,
  Eye,
  ShieldAlert,
  Info,
  UserX,
  UserCheck,
} from "lucide-react";
import { useApp } from "@/hooks/use-app";
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
import { DashboardSection, StatCard } from "@/components/dashboard/Shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { IpAddressCell, IpAddressList, UserIpSummary } from "@/components/admin/IpAddressCell";
import { toast } from "sonner";
import { formatApiErrorMessage } from "@/lib/api";
import {
  getIpMonitorSummary,
  getIpMonitorGroups,
  getIpMonitorUsersByIp,
  getIpMonitorLogs,
  updateUserIpRiskFlag,
  type IpMonitorGroup,
  type IpMonitorUser,
  type IpMonitorSummary,
  type IpDetail,
  type IpLogEntry,
} from "@/services/ip-monitor-api";
import { setAdminUserActive } from "@/services/admin-users-api";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const RISK_BADGE: Record<string, string> = {
  low: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  medium: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  high: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

export function IpMonitorPanel() {
  const { user: currentUser } = useApp();
  const [summary, setSummary] = useState<IpMonitorSummary | null>(null);
  const [groups, setGroups] = useState<IpMonitorGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIp, setSelectedIp] = useState<string | null>(null);
  const [detail, setDetail] = useState<IpDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [noteUserId, setNoteUserId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [noteFlag, setNoteFlag] = useState(true);
  const [logs, setLogs] = useState<IpLogEntry[]>([]);
  const [logsPage, setLogsPage] = useState(1);
  const [logsTotal, setLogsTotal] = useState(0);
  const [logFilterIp, setLogFilterIp] = useState("");
  const [logFilterAction, setLogFilterAction] = useState<string>("all");
  const [logFilterRole, setLogFilterRole] = useState<string>("all");
  const [logsLoading, setLogsLoading] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<IpMonitorUser | null>(null);
  const [deactivateLoading, setDeactivateLoading] = useState(false);

  const loadLogs = useCallback(async (page = 1) => {
    setLogsLoading(true);
    try {
      const res = await getIpMonitorLogs({
        page,
        limit: 20,
        ipAddress: logFilterIp.trim() || undefined,
        action: logFilterAction === "all" ? undefined : logFilterAction,
        role: logFilterRole === "all" ? undefined : logFilterRole,
      });
      setLogs(res.items);
      setLogsTotal(res.pagination.total);
      setLogsPage(page);
    } catch (e) {
      toast.error(formatApiErrorMessage(e, "Failed to load activity logs"));
    } finally {
      setLogsLoading(false);
    }
  }, [logFilterIp, logFilterAction, logFilterRole]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, g] = await Promise.all([getIpMonitorSummary(), getIpMonitorGroups()]);
      setSummary(s);
      setGroups(g);
    } catch (e) {
      setError(formatApiErrorMessage(e, "Failed to load IP monitor data"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    loadLogs(1);
  }, []);

  const openDetail = async (ip: string) => {
    setSelectedIp(ip);
    setDetailLoading(true);
    try {
      const d = await getIpMonitorUsersByIp(ip);
      setDetail(d);
    } catch (e) {
      toast.error(formatApiErrorMessage(e, "Could not load IP details"));
      setSelectedIp(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const saveUserFlag = async () => {
    if (!noteUserId) return;
    try {
      await updateUserIpRiskFlag(noteUserId, { ipRiskFlag: noteFlag, ipAdminNote: noteText });
      toast.success("User flag updated");
      setNoteUserId(null);
      if (selectedIp) await openDetail(selectedIp);
      load();
    } catch (e) {
      toast.error(formatApiErrorMessage(e, "Update failed"));
    }
  };

  const confirmDeactivate = async () => {
    if (!deactivateTarget) return;
    setDeactivateLoading(true);
    try {
      const active = deactivateTarget.isActive === false;
      await setAdminUserActive(deactivateTarget.id, active);
      toast.success(active ? "Account reactivated" : "Account deactivated — user cannot log in");
      setDeactivateTarget(null);
      if (selectedIp) await openDetail(selectedIp);
      load();
    } catch (e) {
      toast.error(formatApiErrorMessage(e, "Could not update account status"));
    } finally {
      setDeactivateLoading(false);
    }
  };

  const canToggleActive = (u: IpMonitorUser) => {
    if (currentUser?.id === u.id) return false;
    if (u.role === "admin") return false;
    return true;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="text-sm text-destructive">{error}</p>
        <Button variant="outline" className="mt-4" onClick={load}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      <DashboardSection
        id="ip-monitor"
        title="Same IP Users"
        description="Review accounts that share the same IP address. No accounts are blocked automatically."
      >
        <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50/80 dark:border-blue-900/40 dark:bg-blue-950/30 p-4 text-sm text-muted-foreground flex gap-2">
          <Info className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
          <p>
            Shared IPs are common for families, schools, coaching centers, offices, hostels, and public Wi‑Fi.
            Use this report for manual review only — do not auto-ban users.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Flagged IPs"
            value={String(summary?.totalFlaggedIps ?? 0)}
            icon={Network}
            color="from-sky-400 to-blue-600"
          />
          <StatCard
            label="Affected users"
            value={String(summary?.totalAffectedUsers ?? 0)}
            icon={Users}
            color="from-violet-400 to-purple-600"
          />
          <StatCard
            label="High risk IPs"
            value={String(summary?.highRiskIps ?? 0)}
            icon={AlertTriangle}
            color="from-red-400 to-rose-600"
          />
          <StatCard
            label="Today's duplicate logins"
            value={String(summary?.todayDuplicateLoginIps ?? 0)}
            icon={Calendar}
            color="from-amber-400 to-orange-500"
          />
        </div>

        {groups.length === 0 ? (
          <div className="rounded-2xl border bg-muted/20 p-10 text-center text-sm text-muted-foreground">
            No shared IP groups detected yet (need 2+ accounts on the same IP). Data appears after users register or log in.
          </div>
        ) : (
          <div className="bg-card border rounded-2xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>IP address</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Account IPs</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>First seen</TableHead>
                  <TableHead>Last seen</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.map((g) => (
                  <TableRow key={g.ipAddress}>
                    <TableCell className="font-mono text-sm">
                      <IpAddressCell ip={g.ipAddress} />
                    </TableCell>
                    <TableCell>{g.totalUsers}</TableCell>
                    <TableCell>
                      <IpAddressList users={g.users} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      S:{g.roleCounts.student} T:{g.roleCounts.teacher} P:{g.roleCounts.parent} A:
                      {g.roleCounts.admin}
                    </TableCell>
                    <TableCell>
                      <Badge className={RISK_BADGE[g.riskLevel] ?? ""}>{g.riskLevel}</Badge>
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap">
                      {new Date(g.firstSeenAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap">
                      {new Date(g.lastSeenAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => openDetail(g.ipAddress)}>
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DashboardSection>

      <DashboardSection
        id="ip-activity-logs"
        title="IP activity logs"
        description="Register and login events with IP and device info."
      >
        <div className="flex flex-wrap gap-3 mb-4">
          <Input
            placeholder="Filter by IP"
            className="max-w-[200px]"
            value={logFilterIp}
            onChange={(e) => setLogFilterIp(e.target.value)}
          />
          <Select value={logFilterAction} onValueChange={setLogFilterAction}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All actions</SelectItem>
              <SelectItem value="login">Login</SelectItem>
              <SelectItem value="register">Register</SelectItem>
            </SelectContent>
          </Select>
          <Select value={logFilterRole} onValueChange={setLogFilterRole}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="teacher">Teacher</SelectItem>
              <SelectItem value="parent">Parent</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="secondary" onClick={() => loadLogs(1)}>
            Apply filters
          </Button>
        </div>

        {logsLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : logs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No IP logs yet.</p>
        ) : (
          <>
            <div className="bg-card border rounded-2xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>When</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">{log.email}</TableCell>
                      <TableCell className="capitalize text-sm">{log.role}</TableCell>
                      <TableCell className="font-mono text-xs">
                        <IpAddressCell ip={log.ipAddress} />
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[160px] truncate">
                        {log.deviceInfo || log.userAgent || "—"}
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
              <span>
                Page {logsPage} · {logsTotal} total
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={logsPage <= 1}
                  onClick={() => loadLogs(logsPage - 1)}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={logsPage * 20 >= logsTotal}
                  onClick={() => loadLogs(logsPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </DashboardSection>

      <Dialog open={!!selectedIp} onOpenChange={(o) => !o && setSelectedIp(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-600" />
              IP details — <span className="font-mono">{selectedIp}</span>
            </DialogTitle>
          </DialogHeader>

          {detailLoading && (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {!detailLoading && detail && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge className={RISK_BADGE[detail.riskLevel]}>{detail.riskLevel} risk</Badge>
                <Badge variant="outline">{detail.totalUsers} accounts</Badge>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Linked accounts</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>IP addresses</TableHead>
                      <TableHead>Last login</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Flag</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detail.users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.name}</TableCell>
                        <TableCell className="text-sm">{u.email}</TableCell>
                        <TableCell className="capitalize">{u.role}</TableCell>
                        <TableCell>
                          <UserIpSummary
                            registrationIp={u.registrationIp}
                            lastLoginIp={u.lastLoginIp}
                            lastLoginAt={u.lastLoginAt}
                          />
                        </TableCell>
                        <TableCell className="text-xs whitespace-nowrap">
                          {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "—"}
                        </TableCell>
                        <TableCell>
                          {u.isActive === false ? (
                            <Badge variant="destructive">Deactivated</Badge>
                          ) : (
                            <Badge className="bg-emerald-600">Active</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {u.ipRiskFlag ? (
                            <Badge variant="destructive">Flagged</Badge>
                          ) : (
                            <Badge variant="secondary">OK</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setNoteUserId(u.id);
                              setNoteText(u.ipAdminNote || "");
                              setNoteFlag(u.ipRiskFlag);
                            }}
                          >
                            Flag
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              void navigator.clipboard.writeText(u.email);
                              toast.info(`Email copied — find ${u.name} in Admin → Users`);
                            }}
                          >
                            Copy email
                          </Button>
                          {canToggleActive(u) && (
                            <Button
                              size="sm"
                              variant={u.isActive === false ? "outline" : "destructive"}
                              onClick={() => setDeactivateTarget(u)}
                            >
                              {u.isActive === false ? (
                                <>
                                  <UserCheck className="h-3.5 w-3.5 mr-1" />
                                  Reactivate
                                </>
                              ) : (
                                <>
                                  <UserX className="h-3.5 w-3.5 mr-1" />
                                  Deactivate
                                </>
                              )}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Activity log</h3>
                <div className="max-h-64 overflow-y-auto border rounded-xl">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>IP</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Device</TableHead>
                        <TableHead>When</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detail.logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-sm">{log.email}</TableCell>
                          <TableCell className="capitalize text-sm">{log.role}</TableCell>
                          <TableCell>
                            <IpAddressCell ip={log.ipAddress} />
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {log.action}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-[140px] truncate">
                            {log.deviceInfo || "—"}
                          </TableCell>
                          <TableCell className="text-xs whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deactivateTarget}
        onOpenChange={(o) => !o && !deactivateLoading && setDeactivateTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deactivateTarget?.isActive === false ? "Reactivate account?" : "Deactivate account?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deactivateTarget?.isActive === false ? (
                <>
                  <strong>{deactivateTarget?.name}</strong> ({deactivateTarget?.email}) will be able to log in
                  again.
                </>
              ) : (
                <>
                  <strong>{deactivateTarget?.name}</strong> ({deactivateTarget?.email}) will not be able to log in
                  or refresh their session. Existing access tokens may work until they expire.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deactivateLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deactivateLoading}
              className={
                deactivateTarget?.isActive === false ? "" : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              }
              onClick={(e) => {
                e.preventDefault();
                void confirmDeactivate();
              }}
            >
              {deactivateLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : deactivateTarget?.isActive === false ? (
                "Reactivate"
              ) : (
                "Deactivate"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!noteUserId} onOpenChange={(o) => !o && setNoteUserId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update IP risk flag</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Mark as risky</Label>
              <Switch checked={noteFlag} onCheckedChange={setNoteFlag} />
            </div>
            <div>
              <Label>Admin note</Label>
              <Textarea
                className="mt-2"
                rows={3}
                placeholder="e.g. Multiple accounts using same IP — under review"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteUserId(null)}>
              Cancel
            </Button>
            <Button onClick={saveUserFlag}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
