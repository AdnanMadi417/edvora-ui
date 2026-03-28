import { useState } from "react";
import api from "../../../lib/useApi";
import Cookies from "js-cookie";

export type UpdateCommissionTypePayload = {
  name: string;
  description: string;
  is_default: boolean;
};

export function useUpdateCommissionType() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const updateCommissionType = async (
    commissionId: string,
    payload: UpdateCommissionTypePayload
  ) => {
    setLoading(true);
    setError("");

    try {
      const token = Cookies.get("token");

      const res = await api.put(
        `/knowledge-hub/commission-types/${commissionId}`,
        payload,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      return res.data;
    } catch (err: any) {
      console.error("Update commission type error:", err);
      const msg =
        err?.response?.data?.detail?.[0]?.msg || "Failed to update commission type";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateCommissionType,
    loading,
    error,
  };
}
