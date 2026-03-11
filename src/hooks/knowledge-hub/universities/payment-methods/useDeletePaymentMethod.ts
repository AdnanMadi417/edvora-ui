"use client";

import { useState } from "react";
import Cookies from "js-cookie";
import api from "lib/useApi";

export const useDeleteUniversityPaymentMethod = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deletePaymentMethod = async (
    universityId: string,
    universityPaymentMethodId: string
  ): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const token = Cookies.get("token");

      await api.delete(
        `/admin/universities/${universityId}/payment-methods/${universityPaymentMethodId}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

    } catch (err: any) {
      console.error("Delete university payment method error:", err);
      setError(
        err?.response?.data?.detail
          ? JSON.stringify(err.response.data.detail)
          : err?.message || "Failed to delete payment method"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deletePaymentMethod, loading, error };
};