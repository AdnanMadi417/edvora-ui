import api from "lib/useApi";
import Cookies from "js-cookie";
import type {
  CreateUniversityPayload,
  UpdateUniversityPayload,
  SetUniversityHiddenPayload,
  CreateBranchPayload,
  AssignPaymentMethodPayload,
  UpdatePaymentMethodPayload,
  CreateUniversityTypePayload,
  UpdateUniversityTypePayload,
  AssignUniversityTypePayload,
  ApplicationRequiredField,
} from "../types";

const authHeader = () => {
  const token = Cookies.get("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const universityApi = {
  universities: {
    list: (params?: Record<string, unknown>) => api.get("/knowledge-hub/universities", { params }),
    get: (id: string) => api.get(`/knowledge-hub/universities/${id}`),
    create: (data: CreateUniversityPayload) =>
      api.post("/knowledge-hub/universities", data, { headers: authHeader() }),
    update: (id: string, data: UpdateUniversityPayload | SetUniversityHiddenPayload) =>
      api.put(`/knowledge-hub/universities/${id}`, data),
    delete: (id: string) =>
      api.delete(`/knowledge-hub/universities/${id}`, { headers: authHeader() }),
  },

  branches: {
    list: (universityId: string) =>
      api.get(`/knowledge-hub/universities/${universityId}/branches`),
    create: (universityId: string, data: CreateBranchPayload) =>
      api.post(`/knowledge-hub/universities/${universityId}/branches`, data, { headers: authHeader() }),
    delete: (universityId: string, branchId: string) =>
      api.delete(`/knowledge-hub/universities/${universityId}/branches/${branchId}`, { headers: authHeader() }),
  },

  paymentMethods: {
    list: (universityId: string) =>
      api.get(`/admin/universities/${universityId}/payment-methods`, { headers: authHeader() }),
    assign: (universityId: string, data: AssignPaymentMethodPayload) =>
      api.post(`/admin/universities/${universityId}/payment-methods`, data, { headers: authHeader() }),
    update: (universityId: string, methodId: string, data: UpdatePaymentMethodPayload) =>
      api.put(`/admin/universities/${universityId}/payment-methods/${methodId}`, data),
    delete: (universityId: string, methodId: string) =>
      api.delete(`/admin/universities/${universityId}/payment-methods/${methodId}`, { headers: authHeader() }),
  },

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
