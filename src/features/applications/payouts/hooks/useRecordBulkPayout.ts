import { useState } from "react";
import { payoutsApi } from "../services";
import type { RecordBulkPayoutPayload } from "../types";
import { parseApiError } from "utils/parseApiError";

export function useRecordBulkPayout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recordBulkPayout = async (partnerId: string, payload: RecordBulkPayoutPayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await payoutsApi.recordBulk(partnerId, payload);
      return res.data;
    } catch (err: unknown) {
      setError(parseApiError(err, "Failed to record payout"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { recordBulkPayout, loading, error };
}
