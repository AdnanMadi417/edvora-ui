import { useState } from "react";
import Cookies from "js-cookie";
import { programApi } from "../services";
import type { UpdateDefaultVisaFeePayload } from "../types";

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
      const res = await programApi.admin.updateDefaultVisaFee(payload);
      return res.data;
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.response?.data?.detail || "Failed to update default visa fee");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateDefaultVisaFee, loading, error };
}
