import Cookies from "js-cookie";
import api from "lib/useApi";
import type { Bank, BanksListParams, CreateBankPayload, UpdateBankPayload } from "../types";

// api's own interceptor already attaches the bearer token, but every other
// service file in this codebase also sets it explicitly — kept for
// consistency rather than cleaning up the redundancy here.
const authHeader = () => {
  const token = Cookies.get("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const banksApi = {
  list: (params?: BanksListParams) => api.get<Bank[]>("/banks", { params, headers: authHeader() }),
  create: (payload: CreateBankPayload) => api.post<Bank>("/banks", payload, { headers: authHeader() }),
  update: (id: string, payload: UpdateBankPayload) => api.patch<Bank>(`/banks/${id}`, payload, { headers: authHeader() }),
};
