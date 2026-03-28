import { useState } from "react";
import api from "lib/useApi";
import Cookies from "js-cookie";

export type AssignManagerPayload = {
  manager_id: string;
};

export function useAssignPartnerManager() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const assignManager = async (
    partnerId: string,
    payload: AssignManagerPayload
  ) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = Cookies.get("token");

      const res = await api.post(
        `/admin/partners/${partnerId}/assign-manager`,
        payload,
        {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
        }
      );

      setSuccess(true);
      return res.data;
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.detail?.[0]?.msg ||
        "Failed to assign manager"
      );

      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    assignManager,
    loading,
    error,
    success,
  };
}