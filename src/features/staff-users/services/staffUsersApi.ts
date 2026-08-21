import api from "lib/useApi";
import Cookies from "js-cookie";
import type { StaffUser, ListStaffUsersParams } from "../types";

const authHeader = () => {
  const token = Cookies.get("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const staffUsersApi = {
  list: (params?: ListStaffUsersParams) =>
    api.get<{ items: StaffUser[]; total: number; page: number; page_size: number }>(
      "/admin/staff-users",
      { params, headers: authHeader() }
    ),

  get: (userId: string) =>
    api.get<StaffUser>(`/admin/staff-users/${userId}`, { headers: authHeader() }),

  suspend: (userId: string) =>
    api.patch<StaffUser>(`/admin/staff-users/${userId}/suspend`, undefined, {
      headers: authHeader(),
    }),

  reactivate: (userId: string) =>
    api.patch<StaffUser>(`/admin/staff-users/${userId}/reactivate`, undefined, {
      headers: authHeader(),
    }),
};
