import api from "lib/useApi";
import Cookies from "js-cookie";
import type {
  Role,
  Permission,
  CreateRolePayload,
  UpdateRolePayload,
} from "../types";

const authHeader = () => {
  const token = Cookies.get("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const rolesApi = {
  list: () =>
    api.get<Role[]>("/admin/roles", { headers: authHeader() }),

  create: (payload: CreateRolePayload) =>
    api.post<Role>("/admin/roles", payload, { headers: authHeader() }),

  rename: (id: number, payload: UpdateRolePayload) =>
    api.put<Role>(`/admin/roles/${id}`, payload, { headers: authHeader() }),

  delete: (id: number) =>
    api.delete(`/admin/roles/${id}`, { headers: authHeader() }),

  listPermissionsCatalog: () =>
    api.get<Permission[]>("/admin/permissions", { headers: authHeader() }),

  getRolePermissions: (id: number) =>
    api.get<Permission[]>(`/admin/roles/${id}/permissions`, {
      headers: authHeader(),
    }),

  setRolePermissions: (id: number, permissionIds: string[]) =>
    api.put(
      `/admin/roles/${id}/permissions`,
      { permission_ids: permissionIds },
      { headers: authHeader() }
    ),
};
