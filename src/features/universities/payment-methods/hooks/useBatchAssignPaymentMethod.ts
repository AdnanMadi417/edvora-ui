"use client";

import { useState } from "react";
import { paymentMethodsApi } from "../services";

import type { BatchAssignPayload } from "../types";

export const useBatchAssignPaymentMethod = () => {
  const [loading, setLoading] = useState(false);

  const batchAssignPaymentMethod = async (payload: BatchAssignPayload) => {
    try {
      setLoading(true);
      const res = await paymentMethodsApi.batchAssign(payload);
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
