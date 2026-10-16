import { useState } from "react";
import { payoutsApi } from "../services";
import type { VoidPayoutPayload } from "../types";
import { parseApiError } from "utils/parseApiError";

export function useVoidPayout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const voidPayout = async (payoutId: string, payload: VoidPayoutPayload) => {
    setLoading(true);
    setError(null);
    try {
      await payoutsApi.void(payoutId, payload);
    } catch (err: unknown) {
      setError(parseApiError(err, "Failed to void payout"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { voidPayout, loading, error };
}
