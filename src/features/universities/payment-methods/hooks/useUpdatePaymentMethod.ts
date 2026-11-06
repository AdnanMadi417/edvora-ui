import { useState } from "react";
import { paymentMethodsApi } from "../services";
import { parseApiError } from "utils/parseApiError";

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
      const res = await paymentMethodsApi.update(paymentMethodId, payload);
      setData(res.data);
      return res.data;
    } catch (err: unknown) {
      setError(parseApiError(err, "Failed to update payment method"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updatePaymentMethods, loading, error, data };
}
