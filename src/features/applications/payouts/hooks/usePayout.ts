import { useEffect, useState, useCallback } from "react";
import { payoutsApi } from "../services";
import type { Payout } from "../types";
import { parseApiError } from "utils/parseApiError";

export function usePayout(payoutId: string) {
  const [payout, setPayout] = useState<Payout | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPayout = useCallback(async () => {
    if (!payoutId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await payoutsApi.get(payoutId);
      setPayout(res.data);
    } catch (err: unknown) {
      setError(parseApiError(err, "Failed to fetch payout"));
    } finally {
      setLoading(false);
    }
  }, [payoutId]);

  useEffect(() => {
    fetchPayout();
  }, [fetchPayout]);

  return { payout, loading, error, refetch: fetchPayout };
}
