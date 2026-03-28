import { useState } from "react";
import api from "lib/useApi";

export interface UpdatePartnerProfilePayload {
  type?: string;
  country?: string;
  phone?: string;
}

export function useUpdatePartnerProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = async (payload: UpdatePartnerProfilePayload) => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.put("/partners/profile", payload);

      return res.data;
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ||
        "Failed to update profile";

      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateProfile,
    loading,
    error,
  };
}