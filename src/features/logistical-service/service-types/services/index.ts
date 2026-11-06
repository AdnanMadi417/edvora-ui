import api from "lib/useApi";
import Cookies from "js-cookie";
import type {
  LogisticServices,
  CreateLogisticServicePayload,
  EditLogisticServicePayload,
} from "../types";
const config = () => {
  const token = Cookies.get("token");
  return { headers: token ? { Authorization: `Bearer ${token}` } : {} };
};
export const serviceTypesApi = {
  list: () => api.get<LogisticServices>("/logistic-services", config()),
  create: (payload: CreateLogisticServicePayload) =>
    api.post("/admin/logistic-services", payload, config()),
  update: (id: string, payload: EditLogisticServicePayload) =>
    api.put(`/admin/logistic-services/${id}`, payload, config()),
  delete: (id: string) =>
    api.delete(`/admin/logistic-services/${id}`, config()),
};
