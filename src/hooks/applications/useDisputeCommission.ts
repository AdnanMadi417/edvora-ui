import { useState } from "react";
import api from "lib/useApi";

interface DisputeCommissionPayload {
  reason_text: string;
  file_key?: string;
  file_url?: string;
}

export function useDisputeCommission(applicationId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const disputeCommission = async (payload: DisputeCommissionPayload) => {
    setLoading(true);
    setError(null);
    try {
      await api.post(`/applications/${applicationId}/dispute-commission`, payload);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to submit dispute";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { disputeCommission, loading, error };
}
