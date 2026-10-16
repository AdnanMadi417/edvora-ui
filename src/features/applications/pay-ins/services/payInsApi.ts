import api from "lib/useApi";
import type { VoidPayInPayload } from "../types";

export const payInsApi = {
  void: (payInId: string, payload: VoidPayInPayload) =>
    api.post(`/admin/pay-ins/${payInId}/void`, payload),
};
