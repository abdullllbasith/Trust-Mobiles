export const ADMIN_PERMISSIONS = [
  { id: "inventory", label: "Inventory", description: "Add, edit, and delete products" },
  { id: "categories", label: "Categories", description: "Manage product categories" },
  { id: "brands", label: "Brands", description: "Manage brands" },
  { id: "users", label: "User Roles", description: "Create users and assign permissions" },
  { id: "promotions", label: "Promotions", description: "Manage ads and promotions" },
  {
    id: "happy_customers",
    label: "Happy Customers",
    description: "Manage the homepage happy customers carousel",
  },
] as const;

export type AdminPermissionId = (typeof ADMIN_PERMISSIONS)[number]["id"];

export const ALL_ADMIN_PERMISSION_IDS: AdminPermissionId[] =
  ADMIN_PERMISSIONS.map((p) => p.id);

export function normalizePermissions(raw: unknown): AdminPermissionId[] {
  if (!Array.isArray(raw)) return [];
  const allowed = new Set<string>(ALL_ADMIN_PERMISSION_IDS);
  return [
    ...new Set(
      raw
        .map((p) => String(p || "").trim().toLowerCase())
        .filter((p): p is AdminPermissionId => allowed.has(p)),
    ),
  ];
}

/** Empty permissions = full access (legacy / super admin). */
export function hasPermission(
  permissions: string[] | undefined | null,
  permission: AdminPermissionId,
): boolean {
  const list = normalizePermissions(permissions);
  if (list.length === 0) return true;
  return list.includes(permission);
}

export function effectivePermissions(
  permissions: string[] | undefined | null,
): AdminPermissionId[] {
  const list = normalizePermissions(permissions);
  return list.length === 0 ? [...ALL_ADMIN_PERMISSION_IDS] : list;
}
