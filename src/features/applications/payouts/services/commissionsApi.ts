import api from "lib/useApi";
import type { CommissionQueueResponse, WaitingOn } from "../types";

export interface CommissionQueueParams {
  page?: number;
  page_size?: number;
  partner_id?: string;
  waiting_on?: WaitingOn;
  hide_settled?: boolean;
}

export const commissionsApi = {
  list: (params: CommissionQueueParams) =>
    api.get<CommissionQueueResponse>("/admin/finance/commissions", { params }),
};
