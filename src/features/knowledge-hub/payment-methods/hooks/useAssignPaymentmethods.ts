import { useState } from "react";
import api from "lib/useApi";
import Cookies from "js-cookie";
import { parseApiError } from "utils/parseApiError";

export interface UpdatePaymentMethodPayload {
  id: string;
  name: string;
  description: string;
}

export function useUpdatePaymentMethods() {
  const [updating, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePaymentMethods = async (payloads: UpdatePaymentMethodPayload[]) => {
    setLoading(true);
    setError(null);
    try {
      const token = Cookies.get("token");
      for (const payload of payloads) {
        await api.put(
          `/admin/payment-methods/${payload.id}`,
          { name: payload.name, description: payload.description },
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
      }
    } catch (err: unknown) {
      setError(parseApiError(err, "Failed to update payment methods"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updatePaymentMethods, updating, error };
}
