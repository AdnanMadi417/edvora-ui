import { useState } from "react";
import { programApi } from "../services";
import type { BatchUpdateProgramPayload } from "../types";

export function useBatchUpdatePrograms() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const batchUpdatePrograms = async (payload: BatchUpdateProgramPayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await programApi.programs.batchUpdate(payload);
      return res.data;
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Batch update programs failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { batchUpdatePrograms, loading, error };
}
