import { mock, httpError } from "../router";
import type { Permission, Role } from "features/roles/types";

// Roles & permissions (admin/roles). Role ids are numeric; the three system
// roles match the staff-user role filter codes.

export const ROLES: Role[] = [
  { id: 1, code: "admin", name: "Administrator", is_system: true },
  { id: 2, code: "reviewer", name: "Application Reviewer", is_system: true },
  { id: 3, code: "data_entry", name: "Data Entry", is_system: true },
  { id: 4, code: "finance_officer", name: "Finance Officer", is_system: false },
  { id: 5, code: "marketing_lead", name: "Marketing Lead", is_system: false },
  { id: 6, code: "support_agent", name: "Support Agent", is_system: false },
];

const RESOURCES: [string, string[]][] = [
  ["applications", ["read", "create", "update", "delete", "approve"]],
  ["partners", ["read", "create", "update", "verify"]],
  ["universities", ["read", "create", "update", "delete"]],
  ["programs", ["read", "create", "update", "delete"]],
  ["commissions", ["read", "update", "approve", "pay"]],
  ["staff_users", ["read", "invite", "suspend"]],
  ["roles", ["read", "manage"]],
  ["account_managers", ["read", "create", "update", "delete"]],
  ["knowledge_hub", ["read", "publish"]],
  ["logistics", ["read", "manage"]],
];

export const PERMISSIONS: Permission[] = RESOURCES.flatMap(([resource, actions]) =>
  actions.map((action) => ({
    id: `perm_${resource}_${action}`,
    resource,
    action,
    description: `${action[0].toUpperCase()}${action.slice(1)} ${resource.replace(/_/g, " ")}`,
  })),
);

const byResource = (...resources: string[]) => PERMISSIONS.filter((p) => resources.includes(p.resource)).map((p) => p.id);
const readOnly = (...resources: string[]) =>
  PERMISSIONS.filter((p) => resources.includes(p.resource) && p.action === "read").map((p) => p.id);

const rolePermissions = new Map<number, string[]>([
  [1, PERMISSIONS.map((p) => p.id)],
  [2, [...byResource("applications"), ...readOnly("partners", "universities", "programs", "knowledge_hub")]],
  [3, [...byResource("universities", "programs"), ...readOnly("applications", "logistics"), "perm_logistics_manage"]],
  [4, [...byResource("commissions"), ...readOnly("applications", "partners")]],
  [5, [...byResource("knowledge_hub"), ...readOnly("partners", "universities", "programs")]],
  [6, readOnly("applications", "partners", "knowledge_hub", "logistics")],
]);

let nextRoleId = 7;
const findRole = (id: string) => {
  const role = ROLES.find((r) => r.id === Number(id));
  if (!role) throw httpError(404, "Role not found");
  return role;
};

mock.get("/admin/roles", () => ROLES);

mock.post("/admin/roles", ({ body }) => {
  const code = String(body?.code ?? "").trim();
  if (ROLES.some((r) => r.code === code)) throw httpError(409, "A role with this code already exists");
  const role: Role = { id: nextRoleId++, code, name: String(body?.name ?? code), is_system: false };
  ROLES.push(role);
  rolePermissions.set(role.id, []);
  return role;
});

mock.put("/admin/roles/:id", ({ params, body }) => {
  const role = findRole(params.id);
  if (role.is_system) throw httpError(403, "System roles can't be renamed");
  role.name = String(body?.name ?? role.name);
  return role;
});

mock.delete("/admin/roles/:id", ({ params }) => {
  const role = findRole(params.id);
  if (role.is_system) throw httpError(403, "System roles can't be deleted");
  ROLES.splice(ROLES.indexOf(role), 1);
  rolePermissions.delete(role.id);
  return { message: "Role deleted" };
});

mock.get("/admin/permissions", () => PERMISSIONS);

mock.get("/admin/roles/:id/permissions", ({ params }) => {
  const role = findRole(params.id);
  const ids = rolePermissions.get(role.id) ?? [];
  return PERMISSIONS.filter((p) => ids.includes(p.id));
});

mock.put("/admin/roles/:id/permissions", ({ params, body }) => {
  const role = findRole(params.id);
  const ids: string[] = Array.isArray(body?.permission_ids) ? body.permission_ids : [];
  rolePermissions.set(role.id, ids);
  return PERMISSIONS.filter((p) => ids.includes(p.id));
});
