import { useState } from "react";
import api from "../../../lib/useApi";


interface BatchUpdateProgramPayload {
  program_ids: string[];

  english_required_score?: string;
  
  intake_dates?: string[];
  commission_amount?: number;
  commission_type_id?: string;
  commission_notes?: string;
  expected_commission_from?: string;
  expected_commission_to?: string;

  scholarships?: Array<{
    type: number;
    coverage_percent: number;
    max_amount: number;
    name: string;
    description: string;
    conditions: string[];
  }>;

}

export function useBatchUpdatePrograms() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const batchUpdatePrograms = async (
    payload: BatchUpdateProgramPayload,
  ) => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.put(
        "/knowledge-hub/programs-batch",
        payload
      );

      return res.data;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.detail ||
        "Batch update programs failed";

      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    batchUpdatePrograms,
    loading,
    error,
  };
}