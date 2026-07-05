"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, UserX, UserCheck } from "lucide-react";
import { setAdminUserActive } from "@/services/admin-users-api";
import { api, formatApiErrorMessage } from "@/lib/api";
import type { AuthUser } from "@/lib/auth-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { IpAddressCell, UserIpSummary } from "@/components/admin/IpAddressCell";
import { toast } from "sonner";

type PaginatedUsers = {
  items: AuthUser[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "student" as "student" | "teacher" | "parent" | "admin",
  phone: "",
  isActive: true,
  isVerified: false,
};

export function UsersPanel() {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AuthUser | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (filterRole !== "all") params.set("role", filterRole);
      if (search.trim()) params.set("q", search.trim());
      const data = await api<PaginatedUsers>(`/admin/users?${params}`);
      setUsers(data.items);
    } catch (e) {
      toast.error(formatApiErrorMessage(e, "Failed to load users"));
    } finally {
      setLoading(false);
    }
  }, [filterRole, search]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (u: AuthUser) => {
    setEditing(u);
    setForm({
      name: u.name,
      email: u.email || "",
      password: "",
      role: u.role,
      phone: u.phone || "",
      isActive: u.isActive !== false,
      isVerified: u.isVerified === true,
    });
    setOpen(true);
  };

  const save = async () => {
    try {
      if (editing) {
        const body: Record<string, unknown> = {
          name: form.name,
          email: form.email,
          role: form.role,
          phone: form.phone,
          isActive: form.isActive,
          isVerified: form.isVerified,
        };
        if (form.password) body.password = form.password;
        await api(`/admin/users/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
        toast.success("User updated");
      } else {
        await api("/admin/users", {
          method: "POST",
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
            role: form.role,
            phone: form.phone || undefined,
            isActive: form.isActive,
            isVerified: form.isVerified,
          }),
        });
        toast.success("User created");
      }
      setOpen(false);
      load();
    } catch (e) {
      toast.error(formatApiErrorMessage(e, "Save failed"));
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this user permanently?")) return;
    try {
      await api(`/admin/users/${id}`, { method: "DELETE" });
      toast.success("User deleted");
      load();
    } catch (e) {
      toast.error(formatApiErrorMessage(e, "Delete failed"));
    }
  };

  const toggleActive = async (u: AuthUser) => {
    const reactivating = u.isActive === false;
    const label = reactivating ? "reactivate" : "deactivate";
    if (!confirm(`${reactivating ? "Reactivate" : "Deactivate"} ${u.name}? They ${reactivating ? "will" : "will not"} be able to log in.`)) {
      return;
    }
    try {
      await setAdminUserActive(u.id, reactivating);
      toast.success(reactivating ? "Account reactivated" : "Account deactivated");
      load();
    } catch (e) {
      toast.error(formatApiErrorMessage(e, `Could not ${label} user`));
    }
  };

  return (
    <div className="bg-card border rounded-2xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="font-display font-bold">Users ({users.length})</h2>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add user
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <Input
          placeholder="Search name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="student">Students</SelectItem>
            <SelectItem value="teacher">Tutors</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
            <SelectItem value="parent">Parents</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={load}>
          Refresh
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Loading users…</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>IP addresses</TableHead>
                <TableHead>IP flag</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {u.role === "teacher" ? "tutor" : u.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <UserIpSummary
                      registrationIp={u.registrationIp}
                      lastLoginIp={u.lastLoginIp}
                      lastLoginAt={u.lastLoginAt}
                    />
                  </TableCell>
                  <TableCell>
                    {u.ipRiskFlag ? (
                      <Badge variant="destructive">Flagged</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {u.isActive === false ? (
                      <Badge variant="destructive">Disabled</Badge>
                    ) : (
                      <Badge className="bg-emerald-600">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    {u.role !== "admin" && (
                      <Button
                        size="icon"
                        variant="ghost"
                        title={u.isActive === false ? "Reactivate" : "Deactivate"}
                        onClick={() => toggleActive(u)}
                      >
                        {u.isActive === false ? (
                          <UserCheck className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <UserX className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" onClick={() => openEdit(u)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(u.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit user" : "Add user"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <Label>{editing ? "New password (optional)" : "Password"}</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                minLength={editing ? 0 : 8}
              />
            </div>
            <div>
              <Label>Role</Label>
              <Select
                value={form.role}
                onValueChange={(v) => setForm({ ...form, role: v as typeof form.role })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="teacher">Tutor</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            {editing && (
              <div className="rounded-lg border bg-muted/30 p-3 text-xs space-y-2">
                <p className="font-medium text-foreground">IP tracking (read-only)</p>
                <UserIpSummary
                  registrationIp={editing.registrationIp}
                  lastLoginIp={editing.lastLoginIp}
                  lastLoginAt={editing.lastLoginAt}
                />
              </div>
            )}
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch
                checked={form.isActive}
                onCheckedChange={(c) => setForm({ ...form, isActive: c })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Verified</Label>
              <Switch
                checked={form.isVerified}
                onCheckedChange={(c) => setForm({ ...form, isVerified: c })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>{editing ? "Save" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
