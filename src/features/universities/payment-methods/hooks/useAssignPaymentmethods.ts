import { useState } from "react";
import { paymentMethodsApi } from "../services";
import { parseApiError } from "utils/parseApiError";

export interface UpdatePaymentMethodPayload {
  id: string;
  name: string;
  description: string;
}

export function useUpdatePaymentMethods() {
  const [updating, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePaymentMethods = async (
    payloads: UpdatePaymentMethodPayload[]
  ) => {
    setLoading(true);
    setError(null);
    try {
      for (const payload of payloads) {
        await paymentMethodsApi.update(payload.id, {
          name: payload.name,
          description: payload.description,
        });
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
