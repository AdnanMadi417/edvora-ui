import { useState } from "react";
import { universityApi } from "../services";
import type { AssignPaymentMethodPayload } from "../types";

export function useAssignUniversityPaymentMethod() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assignPaymentMethod = async (universityId: string, payload: AssignPaymentMethodPayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await universityApi.paymentMethods.assign(universityId, payload);
      return res.data;
    } catch (err: any) {
      setError(err?.message || "Failed to assign payment method");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { assignPaymentMethod, loading, error };
}
