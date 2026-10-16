import { useState } from "react";
import { disputesApi } from "../services";
import { parseApiError } from "utils/parseApiError";

export function useClaimDispute() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const claimDispute = async (disputeId: string) => {
    setLoading(true);
    setError(null);
    try {
      await disputesApi.claim(disputeId);
    } catch (err: unknown) {
      setError(parseApiError(err, "Failed to claim dispute"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { claimDispute, loading, error };
}
