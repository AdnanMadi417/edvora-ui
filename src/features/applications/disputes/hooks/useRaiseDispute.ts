import { useState } from "react";
import { disputesApi } from "../services";
import type { RaiseDisputePayload } from "../types";
import { parseApiError } from "utils/parseApiError";

export function useRaiseDispute() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const raiseDispute = async (applicationId: string, payload: RaiseDisputePayload) => {
    setLoading(true);
    setError(null);
    try {
      await disputesApi.raise(applicationId, payload);
    } catch (err: unknown) {
      setError(parseApiError(err, "Failed to raise dispute"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { raiseDispute, loading, error };
}
