"use client";

import { useState } from "react";
import api from "lib/useApi";
import Cookies from "js-cookie";

interface BatchAssignPayload {
  payment_method_ids: string[];
  university_ids: string[];
  instructions?: string;
  currency?: string;
  is_active?: boolean;
}

export const useBatchAssignPaymentMethod = () => {
  const [loading, setLoading] = useState(false);

  const batchAssignPaymentMethod = async (payload: BatchAssignPayload) => {
    try {
      setLoading(true);
      const token = Cookies.get("token");
      const res = await api.post("/admin/payment-methods/batch-assign", payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return res.data;
    } catch (error) {
      console.error("Batch assign payment method error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { batchAssignPaymentMethod, loading };
};
