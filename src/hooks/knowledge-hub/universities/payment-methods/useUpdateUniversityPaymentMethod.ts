"use client";

import { useState } from "react";
import api from "lib/useApi";
import { useToast } from "components/context/ToastContext";

interface UpdatePaymentMethodPayload {
  payment_method_id: string;
  instructions?: string;
  currency?: string;
  is_active?: boolean;
}

export const useUpdateUniversityPaymentMethod = () => {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const updateUniversityPaymentMethod = async (
    university_id: string,
    university_payment_method_id: string,
    payload: UpdatePaymentMethodPayload
  ) => {
    setLoading(true);
    try {
      const response = await api.put(
        `/admin/universities/${university_id}/payment-methods/${university_payment_method_id}`,
        payload
      );

      showToast("Payment method updated successfully.", "success");
      setLoading(false);

      return response.data;
    } catch (error: any) {
      setLoading(false);
      const backendMessage = error?.response?.data?.detail?.[0]?.msg || "Please try again.";
      showToast(`Update failed. ${backendMessage}`, "error");
      throw error;
    }
  };

  return { updateUniversityPaymentMethod, loading };
};