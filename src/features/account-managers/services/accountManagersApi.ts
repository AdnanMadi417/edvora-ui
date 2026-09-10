import api from "lib/useApi";
import Cookies from "js-cookie";
import type {
  AccountManager,
  CreateAccountManagerPayload,
  EditAccountManagerPayload,
  TransferPartnersPayload,
  TransferPartnersResult,
} from "../types";

const authHeader = () => {
  const token = Cookies.get("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const accountManagersApi = {
  list: (params?: {
    page?: number;
    page_size?: number;
    search?: string;
    is_active?: boolean;
  }) =>
    api.get<{ items: AccountManager[]; total: number; page: number; page_size: number }>(
      "/admin/account-managers",
      { params, headers: authHeader() }
    ),

  get: (id: string) =>
    api.get<AccountManager>(`/admin/account-managers/${id}`, {
      headers: authHeader(),
    }),

  create: (payload: CreateAccountManagerPayload) =>
    api.post<AccountManager>("/admin/account-managers", payload, {
      headers: authHeader(),
    }),

  update: (id: string, payload: EditAccountManagerPayload) =>
    api.put<AccountManager>(`/admin/account-managers/${id}`, payload, {
      headers: authHeader(),
    }),

  delete: (id: string) =>
    api.delete(`/admin/account-managers/${id}`, { headers: authHeader() }),

  /** Bulk handover of one manager's partners to another (UBX-318). */
  transferPartners: (id: string, payload: TransferPartnersPayload) =>
    api.post<TransferPartnersResult>(
      `/admin/account-managers/${id}/transfer-partners`,
      payload,
      { headers: authHeader() }
    ),
};
