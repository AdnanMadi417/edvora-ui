import api from "lib/useApi";
import type { PaymentMethod } from "../types";

export const paymentMethodsApi = {
  list: () => api.get<PaymentMethod[]>("/admin/payment-methods"),
};
