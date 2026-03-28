"use client";

import { useState } from "react";
import Cookies from "js-cookie";
import api from "lib/useApi";

interface AssignPaymentMethodBody {
  payment_method_id: string;
  instructions?: string;
  currency?: string;
  is_active?: boolean;
}

interface AssignPaymentMethodResponse {
  id: string;
  university_id: string;
  payment_method_id: string;
  payment_method_name: string;
  instructions?: string;
  currency?: string;
  is_active: boolean;
}

export const useAssignPaymentMethod = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assignPaymentMethod = async (
    university_id: string,
    payload: AssignPaymentMethodBody
  ): Promise<AssignPaymentMethodResponse> => {
    setLoading(true);
    setError(null);

    try {
      const token = Cookies.get("token");

      const res = await api.post(
        `/admin/universities/${university_id}/payment-methods`,
        payload,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      return res.data;
    } catch (err: any) {
      console.error("Assign payment method error:", err);
      setError(err?.message || "Failed to assign payment method");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { assignPaymentMethod, loading, error };
};