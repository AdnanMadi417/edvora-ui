import { useState } from "react";
import api from "../../../lib/useApi";

interface UpdateDefaultVisaFeePayload {
  amount: number;
}

export function useUpdateDefaultVisaFee() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateDefaultVisaFee = async (payload: UpdateDefaultVisaFeePayload) => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.put("/admin/settings/default-visa-fee", payload);
      return res.data;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Failed to update default visa fee";

      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateDefaultVisaFee,
    loading,
    error,
  };
}
