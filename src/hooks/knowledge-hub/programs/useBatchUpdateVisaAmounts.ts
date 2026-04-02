import { useState } from "react";
import Cookies from "js-cookie";
import api from "../../../lib/useApi";

interface UpdateDefaultVisaFeePayload {
  amount: number;
}

export function useUpdateDefaultVisaFee() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateDefaultVisaFee = async (payload: UpdateDefaultVisaFeePayload) => {
    const role = Cookies.get("userRole");

    if (role !== "admin") {
      throw new Error("Unauthorized: only admins can update the default visa fee.");
    }

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
