import api from "lib/useApi";
import type { CreatePayInPayload, UniversityPayIn, VoidPayInPayload } from "../types";

export const payInsApi = {
  create: (payload: CreatePayInPayload) => api.post<UniversityPayIn>("/admin/pay-ins", payload),
  void: (payInId: string, payload: VoidPayInPayload) =>
    api.post(`/admin/pay-ins/${payInId}/void`, payload),
};
