import api from "lib/useApi";
import type { Payout, VoidPayoutPayload, RecordBulkPayoutPayload, PayoutStatementResponse } from "../types";

export const payoutsApi = {
  list: (partnerId: string, params?: { activeOnly?: boolean; latest?: boolean }) =>
    api.get<Payout[]>(`/admin/partners/${partnerId}/payouts`, {
      params: {
        ...(params?.activeOnly ? { active_only: true } : {}),
        ...(params?.latest ? { latest: true } : {}),
      },
    }),
  get: (payoutId: string) => api.get<Payout>(`/admin/payouts/${payoutId}`),
  recordBulk: (partnerId: string, payload: RecordBulkPayoutPayload) =>
    api.post<Payout>(`/admin/partners/${partnerId}/payouts`, payload),
  void: (payoutId: string, payload: VoidPayoutPayload) =>
    api.post(`/admin/payouts/${payoutId}/void`, payload),
  statement: (partnerId: string, params?: { page?: number; page_size?: number; active_only?: boolean }) =>
    api.get<PayoutStatementResponse>(`/admin/partners/${partnerId}/statement`, { params }),
};
