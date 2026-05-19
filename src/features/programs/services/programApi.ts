import api from "lib/useApi";
import Cookies from "js-cookie";
import type {
  CreateProgramPayload,
  UpdateProgramPayload,
  BatchUpdateProgramPayload,
  UpdateDefaultVisaFeePayload,
  GetProgramsParams,
} from "../types";

const authHeader = () => {
  const token = Cookies.get("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const programApi = {
  programs: {
    list: (params?: GetProgramsParams) =>
      api.get("/knowledge-hub/programs", { headers: authHeader(), params }),
    get: (id: string) =>
      api.get(`/knowledge-hub/programs/${id}`, { headers: authHeader() }),
    create: (data: CreateProgramPayload) =>
      api.post("/knowledge-hub/programs", data),
    update: (id: string, data: UpdateProgramPayload) =>
      api.put(`/knowledge-hub/programs/${id}`, data),
    delete: (id: string) =>
      api.delete(`/knowledge-hub/programs/${id}`, { headers: authHeader() }),
    batchDelete: (programIds: string[]) =>
      api.delete("/knowledge-hub/programs", {
        data: { program_ids: programIds },
        headers: authHeader(),
      }),
    batchUpdate: (data: BatchUpdateProgramPayload) =>
      api.put("/knowledge-hub/programs-batch", data),
  },

  states: {
    list: () => api.get("/knowledge-hub/states", { headers: authHeader() }),
  },

  partnerIntakeDates: {
    list: (partnerId: string, programId: string) =>
      api.get(`/partners/${partnerId}/programs/${programId}/intake-dates`, {
        headers: authHeader(),
      }),
  },

  admin: {
    updateDefaultVisaFee: (data: UpdateDefaultVisaFeePayload) =>
      api.put("/admin/settings/default-visa-fee", data),
  },
};
