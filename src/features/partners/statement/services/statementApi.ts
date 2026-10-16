import api from "lib/useApi";
import type { PartnerStatementResponse, WaitingOn } from "../types";

export interface StatementParams {
  page?: number;
  page_size?: number;
  waiting_on?: WaitingOn;
  member_partner_id?: string;
}

export const statementApi = {
  list: (params: StatementParams) => api.get<PartnerStatementResponse>("/partners/statement", { params }),
};
