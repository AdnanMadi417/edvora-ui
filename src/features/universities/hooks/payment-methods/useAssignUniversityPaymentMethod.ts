import { useState } from "react";
import { universityApi } from "../../services";
import type { AssignPaymentMethodPayload } from "../../types";
import { parseApiError } from "utils/parseApiError";

export function useAssignUniversityPaymentMethod() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assignPaymentMethod = async (universityId: string, payload: AssignPaymentMethodPayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await universityApi.paymentMethods.assign(universityId, payload);
      return res.data;
    } catch (err: unknown) {
      setError(parseApiError(err, "Failed to assign payment method"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { assignPaymentMethod, loading, error };
}
