import api from "lib/useApi";
import Cookies from "js-cookie";
import type { CreateUniversityTypePayload, UpdateUniversityTypePayload, AssignUniversityTypePayload, ApplicationRequiredField } from "../types";

const authHeader = () => {
  const token = Cookies.get("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const universityConfigurationApi = {
  types: {
    list: () => api.get("/admin/university-types"),
    get: (typeId: string) => api.get(`/admin/university-types/${typeId}`),
    create: (data: CreateUniversityTypePayload) =>
      api.post("/admin/university-types", data, { headers: authHeader() }),
    update: (typeId: string, data: UpdateUniversityTypePayload) =>
      api.put(`/admin/university-types/${typeId}`, data, { headers: authHeader() }),
    delete: (typeId: string) =>
      api.delete(`/admin/university-types/${typeId}`, { headers: authHeader() }),
    assignToUniversity: (universityId: string, data: AssignUniversityTypePayload) =>
      api.put(`/admin/universities/${universityId}/type`, data, { headers: authHeader() }),
  },

  adminUniversities: {
    list: () =>
      api.get("/admin/universities", { headers: authHeader() }),
  },

  applicationFields: {
    listRequired: (typeId: string) =>
      api.get(`/admin/university-types/${typeId}/application-required-fields`, { headers: authHeader() }),
    getRequiredById: (fieldId: string) =>
      api.get(`/admin/university-types/application-required-fields/${fieldId}`, { headers: authHeader() }),
    updateRequired: (typeId: string, data: ApplicationRequiredField[]) =>
      api.put(`/admin/university-types/${typeId}/application-required-fields`, data, { headers: authHeader() }),
    listSubmission: () => api.get("/admin/application-submission-fields"),
  },
};
