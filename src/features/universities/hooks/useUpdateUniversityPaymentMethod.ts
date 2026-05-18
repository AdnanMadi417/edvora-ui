import { useState } from "react";
import { universityApi } from "../services";
import { useToast } from "components/context/ToastContext";
import type { UpdatePaymentMethodPayload } from "../types";

export function useUpdateUniversityPaymentMethod() {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const updateUniversityPaymentMethod = async (
    universityId: string,
    universityPaymentMethodId: string,
    payload: UpdatePaymentMethodPayload
  ) => {
    setLoading(true);
    try {
      const res = await universityApi.paymentMethods.update(universityId, universityPaymentMethodId, payload);
      showToast("Payment method updated successfully.", "success");
      return res.data;
    } catch (err: any) {
      const backendMessage = err?.response?.data?.detail?.[0]?.msg || "Please try again.";
      showToast(`Update failed. ${backendMessage}`, "error");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateUniversityPaymentMethod, loading };
}
