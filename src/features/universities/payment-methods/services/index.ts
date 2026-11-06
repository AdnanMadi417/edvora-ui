import api from "lib/useApi";
import Cookies from "js-cookie";
import type { PaymentMethodPayload, BatchAssignPayload } from "../types";
const config = () => {
  const token = Cookies.get("token");
  return { headers: token ? { Authorization: `Bearer ${token}` } : {} };
};
const path = "/admin/payment-methods";
export const paymentMethodsApi = {
  list: () => api.get(path, config()),
  get: (id: string) => api.get(`${path}/${id}`, config()),
  create: (data: PaymentMethodPayload) => api.post(path, data, config()),
  update: (id: string, data: PaymentMethodPayload) =>
    api.put(`${path}/${id}`, data, config()),
  delete: (id: string) => api.delete(`${path}/${id}`, config()),
  batchAssign: (data: BatchAssignPayload) =>
    api.post(`${path}/batch-assign`, data, config()),
};
