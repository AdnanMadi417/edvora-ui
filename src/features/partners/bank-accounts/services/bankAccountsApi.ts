import Cookies from "js-cookie";
import api from "lib/useApi";
import type { PartnerBankAccount, CreatePartnerBankAccountPayload, UpdatePartnerBankAccountPayload } from "../types";

const authHeader = () => {
  const token = Cookies.get("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const partnerBankAccountsApi = {
  list: (partnerId: string) =>
    api.get<PartnerBankAccount[]>(`/partners/${partnerId}/bank-accounts`, { headers: authHeader() }),
  create: (partnerId: string, payload: CreatePartnerBankAccountPayload) =>
    api.post<PartnerBankAccount>(`/partners/${partnerId}/bank-accounts`, payload, { headers: authHeader() }),
  update: (partnerId: string, accountId: string, payload: UpdatePartnerBankAccountPayload) =>
    api.patch<PartnerBankAccount>(`/partners/${partnerId}/bank-accounts/${accountId}`, payload, { headers: authHeader() }),
  history: (partnerId: string, currency?: string) =>
    api.get<PartnerBankAccount[]>(`/partners/${partnerId}/bank-accounts/history`, {
      params: currency ? { currency } : undefined,
      headers: authHeader(),
    }),
};
