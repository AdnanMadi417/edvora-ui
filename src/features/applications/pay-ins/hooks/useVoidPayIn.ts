import { useState } from "react";
import { payInsApi } from "../services";
import type { VoidPayInPayload } from "../types";
import { parseApiError } from "utils/parseApiError";

export function useVoidPayIn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const voidPayIn = async (payInId: string, payload: VoidPayInPayload) => {
    setLoading(true);
    setError(null);
    try {
      await payInsApi.void(payInId, payload);
    } catch (err: unknown) {
      setError(parseApiError(err, "Failed to void pay-in"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { voidPayIn, loading, error };
}
