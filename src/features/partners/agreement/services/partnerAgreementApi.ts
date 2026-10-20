import api from "lib/useApi";
import type { PartnerAgreement } from "../types";

export const partnerAgreementApi = {
  get: (partnerId: string) => api.get<PartnerAgreement>(`/partners/${partnerId}/agreement`),
  start: (partnerId: string) => api.post<PartnerAgreement>(`/partners/${partnerId}/agreement`),
};
