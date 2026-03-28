import { useState } from "react";
import api from "lib/useApi";
import Cookies from "js-cookie";

export interface UpdatePaymentMethodPayload {
  name: string;
  description: string;
}

export interface PaymentMethodResponse {
  id: string;
  name: string;
  description: string;
}

export function useUpdatePaymentMethods() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PaymentMethodResponse | null>(null);

  const updatePaymentMethods = async (
    paymentMethodId: string,
    payload: UpdatePaymentMethodPayload
  ) => {
    if (!paymentMethodId) throw new Error("Payment Method ID is required");

    try {
      setLoading(true);
      setError(null);

      const token = Cookies.get("token");
      const res = await api.put(`/admin/payment-methods/${paymentMethodId}`, payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      setData(res.data);
      return res.data;
    } catch (err: any) {
      setError(err?.response?.data?.detail?.[0]?.msg || "Failed to update payment method");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updatePaymentMethods, loading, error, data };
}