import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Edit, Trash2, Shield, Plus, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import {
  ADMIN_PERMISSIONS,
  ALL_ADMIN_PERMISSION_IDS,
  effectivePermissions,
  normalizePermissions,
  type AdminPermissionId,
} from "@/lib/permissions";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "admin" as "admin" | "user",
  permissions: [...ALL_ADMIN_PERMISSION_IDS] as AdminPermissionId[],
};

export default function AdminUsers({ users = [], loading, fetchData }: any) {
  const { user: currentUser, isSuperAdmin } = useAuthStore();
  const amSuperAdmin = isSuperAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  const isAdmin = (role: string) => String(role || "").toLowerCase() === "admin";
  const isParent = (user: any) => Boolean(user?.isSuperAdmin);

  const canDeleteUser = (user: any) => {
    if (!user?.id) return false;
    if (String(user.id) === String(currentUser?.id)) return false;
    if (isParent(user)) return false;
    if (isAdmin(user.role)) return amSuperAdmin;
    return true;
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({ ...emptyForm, permissions: [...ALL_ADMIN_PERMISSION_IDS] });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: any) => {
    setEditingUser(user);
    const perms = normalizePermissions(user.permissions);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      password: "",
      role: isAdmin(user.role) ? "admin" : "user",
      permissions:
        isAdmin(user.role) && perms.length === 0
          ? [...ALL_ADMIN_PERMISSION_IDS]
          : perms.length
            ? perms
            : [...ALL_ADMIN_PERMISSION_IDS],
    });
    setIsModalOpen(true);
  };

  const togglePermission = (id: AdminPermissionId) => {
    setFormData((prev) => {
      const has = prev.permissions.includes(id);
      return {
        ...prev,
        permissions: has
          ? prev.permissions.filter((p) => p !== id)
          : [...prev.permissions, id],
      };
    });
  };

  const toggleAllPermissions = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      permissions: checked ? [...ALL_ADMIN_PERMISSION_IDS] : [],
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    if (!editingUser && formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (formData.role === "admin" && formData.permissions.length === 0) {
      toast.error("Select at least one permission for admin users");
      return;
    }

    // Never allow demoting an existing admin account
    if (editingUser && isAdmin(editingUser.role) && formData.role !== "admin") {
      toast.error("Admin role cannot be removed.");
      return;
    }

    const allSelected =
      formData.permissions.length === ALL_ADMIN_PERMISSION_IDS.length;

    // Empty permissions on server = full access — only parent super admin may grant that
    if (formData.role === "admin" && allSelected && !amSuperAdmin && !isParent(editingUser)) {
      toast.error(
        "Only the parent super admin can grant full access. Select specific permissions instead.",
      );
      return;
    }

    const permissionsPayload =
      formData.role === "admin"
        ? allSelected && amSuperAdmin
          ? []
          : allSelected
            ? [...ALL_ADMIN_PERMISSION_IDS]
            : formData.permissions
        : [];

    setSaving(true);
    try {
      if (editingUser?.id) {
        const body: Record<string, unknown> = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          role: isAdmin(editingUser.role) ? "admin" : formData.role,
          permissions: isParent(editingUser)
            ? []
            : isAdmin(editingUser.role)
              ? permissionsPayload
              : formData.role === "admin"
                ? permissionsPayload
                : [],
        };
        if (formData.password.trim().length >= 6) {
          body.password = formData.password.trim();
        }
        await apiFetch(`/api/users/${editingUser.id}`, {
          method: "PUT",
          auth: true,
          body: JSON.stringify(body),
          fallbackError: "Failed to update user",
        });
        toast.success("User updated");
      } else {
        await apiFetch("/api/users", {
          method: "POST",
          auth: true,
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim(),
            password: formData.password,
            role: formData.role,
            permissions: permissionsPayload,
          }),
          fallbackError: "Failed to create user",
        });
        toast.success("User created");
      }
      setIsModalOpen(false);
      fetchData({ silent: true });
    } catch (err: any) {
      toast.error(err.message || "Error saving user");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user: any) => {
    if (!canDeleteUser(user)) {
      toast.error(
        isParent(user)
          ? "The parent super admin cannot be deleted."
          : isAdmin(user.role)
            ? "Only the parent super admin can delete other admins."
            : "You cannot delete this user.",
      );
      return;
    }
    if (!confirm(`Delete ${user.name || "this user"}? This cannot be undone.`)) return;
    try {
      await apiFetch(`/api/users/${user.id}`, {
        method: "DELETE",
        auth: true,
        fallbackError: "Failed to delete user",
      });
      toast.success("User deleted");
      fetchData({ silent: true });
    } catch (err: any) {
      toast.error(err.message || "Error deleting user");
    }
  };

  const permissionLabels = (user: any) => {
    if (!isAdmin(user.role)) return "—";
    if (isParent(user)) return "Parent super admin";
    const effective = effectivePermissions(user.permissions);
    if (
      !user.permissions?.length ||
      effective.length === ALL_ADMIN_PERMISSION_IDS.length
    ) {
      return "Full access";
    }
    return effective
      .map((id) => ADMIN_PERMISSIONS.find((p) => p.id === id)?.label || id)
      .join(", ");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>User Roles</CardTitle>
          <CardDescription>
            Assign section access for staff. Only the parent super admin is
            protected from deletion and can remove other admins.
          </CardDescription>
        </div>
        <Button className="gap-2 shrink-0" onClick={handleOpenCreate}>
          <Plus className="h-4 w-4" /> Add User
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user: any) => {
                  const adminUser = isAdmin(user.role);
                  const parent = isParent(user);
                  const allowDelete = canDeleteUser(user);
                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={adminUser ? "default" : "secondary"}
                          className={
                            parent
                              ? "gap-1 bg-[#1C1C1C] text-[#F3EBD8] hover:bg-[#1C1C1C]"
                              : adminUser
                                ? "gap-1 bg-[#C5A059] text-[#1C1C1C] hover:bg-[#C5A059]"
                                : ""
                          }
                        >
                          {parent ? (
                            <Crown className="h-3 w-3" />
                          ) : (
                            adminUser && <Shield className="h-3 w-3" />
                          )}
                          {parent ? "Super Admin" : user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[220px] text-sm text-muted-foreground">
                        {permissionLabels(user)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(user)}
                            aria-label="Edit user"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={!allowDelete}
                            className={
                              allowDelete
                                ? "text-red-500"
                                : "text-stone-300 cursor-not-allowed"
                            }
                            title={
                              parent
                                ? "Parent super admin cannot be deleted"
                                : !allowDelete && adminUser
                                  ? "Only the parent super admin can delete other admins"
                                  : "Delete user"
                            }
                            onClick={() => allowDelete && handleDelete(user)}
                            aria-label={
                              allowDelete ? "Delete user" : "Delete disabled"
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No users found. Add a staff account to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Edit User" : "Add User"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>
                Password{" "}
                {editingUser && (
                  <span className="font-normal text-muted-foreground">
                    (leave blank to keep current)
                  </span>
                )}
              </Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required={!editingUser}
                minLength={editingUser ? undefined : 6}
                placeholder={editingUser ? "••••••••" : "Min. 6 characters"}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              {editingUser && isAdmin(editingUser.role) ? (
                <>
                  <Input
                    value={isParent(editingUser) ? "super admin" : "admin"}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    {isParent(editingUser)
                      ? "Parent super admin — protected and always has full access."
                      : "Admin role is locked and cannot be removed."}
                  </p>
                </>
              ) : (
                <select
                  className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as "admin" | "user",
                      permissions:
                        e.target.value === "admin"
                          ? [...ALL_ADMIN_PERMISSION_IDS]
                          : [],
                    })
                  }
                >
                  <option value="admin">Admin (staff login)</option>
                  <option value="user">User (no admin access)</option>
                </select>
              )}
            </div>

            {formData.role === "admin" && !isParent(editingUser) && (
              <div className="space-y-3 rounded-lg border p-3">
                <div className="flex items-center justify-between gap-2">
                  <Label>Permissions</Label>
                  <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-3.5 w-3.5 accent-[#C5A059]"
                      checked={
                        formData.permissions.length ===
                        ALL_ADMIN_PERMISSION_IDS.length
                      }
                      onChange={(e) => toggleAllPermissions(e.target.checked)}
                    />
                    All
                  </label>
                </div>
                {!amSuperAdmin && (
                  <p className="text-xs text-muted-foreground">
                    Checking “All” grants every section listed below. Only the
                    parent super admin can create another full-access admin.
                  </p>
                )}
                <div className="space-y-2">
                  {ADMIN_PERMISSIONS.map((perm) => (
                    <label
                      key={perm.id}
                      className="flex items-start gap-3 rounded-md border border-transparent px-2 py-1.5 hover:bg-muted/50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="mt-1 h-3.5 w-3.5 accent-[#C5A059]"
                        checked={formData.permissions.includes(perm.id)}
                        onChange={() => togglePermission(perm.id)}
                      />
                      <span>
                        <span className="block text-sm font-medium">
                          {perm.label}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {perm.description}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {isParent(editingUser) && (
              <p className="text-xs text-muted-foreground rounded-lg border bg-muted/40 px-3 py-2">
                Parent super admin always has full access to every section.
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving
                  ? "Saving..."
                  : editingUser
                    ? "Save Changes"
                    : "Create User"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
