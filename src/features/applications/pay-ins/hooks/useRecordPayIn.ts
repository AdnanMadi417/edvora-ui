import { useState } from "react";
import { payInsApi } from "../services";
import type { CreatePayInPayload } from "../types";
import { parseApiError } from "utils/parseApiError";

export function useRecordPayIn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recordPayIn = async (payload: CreatePayInPayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await payInsApi.create(payload);
      return res.data;
    } catch (err: unknown) {
      setError(parseApiError(err, "Failed to record pay-in"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { recordPayIn, loading, error };
}
