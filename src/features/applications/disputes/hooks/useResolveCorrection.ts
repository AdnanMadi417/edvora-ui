import { useState } from "react";
import { disputesApi } from "../services";
import type { ResolveCorrectionPayload } from "../types";
import { parseApiError } from "utils/parseApiError";

export function useResolveCorrection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolveCorrection = async (disputeId: string, payload: ResolveCorrectionPayload) => {
    setLoading(true);
    setError(null);
    try {
      await disputesApi.resolveCorrection(disputeId, payload);
    } catch (err: unknown) {
      setError(parseApiError(err, "Failed to resolve dispute"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { resolveCorrection, loading, error };
}
