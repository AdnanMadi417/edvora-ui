import type { Role } from "features/roles/types";

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  is_active: boolean;
}

export interface ListStaffUsersParams {
  role?: "admin" | "reviewer" | "data_entry";
  is_active?: boolean;
  search?: string;
  page?: number;
  page_size?: number;
}
