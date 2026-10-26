import { useState } from "react";
import { disputesApi } from "../services";
import type { CompleteCommissionPayload } from "../types";
import { parseApiError } from "utils/parseApiError";

export function useCompleteCommission() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completeOnBehalf = async (applicationId: string, payload: CompleteCommissionPayload) => {
    setLoading(true);
    setError(null);
    try {
      await disputesApi.completeOnBehalf(applicationId, payload);
    } catch (err: unknown) {
      setError(parseApiError(err, "Failed to complete commission"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { completeOnBehalf, loading, error };
}
