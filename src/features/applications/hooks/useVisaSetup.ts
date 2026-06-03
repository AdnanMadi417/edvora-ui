"use client";

import { useState } from "react";
import api from "lib/useApi";
import { useToast } from "components/context/ToastContext";

interface UseVisaSetupReturn {
  submitVisaFee: (applicationId: string, amount: number) => Promise<void>;
  isSubmitting: boolean;
}

export const useVisaSetup = (): UseVisaSetupReturn => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const submitVisaFee = async (applicationId: string, amount: number) => {
    try {
      setIsSubmitting(true);
      await api.patch(`/applications/${applicationId}/visa-case`, {
        visa_fee_amount: amount,
        visa_reference_number: "UB" + Date.now(),
        notes: "Visa fee amount updated by manager.",
      });
      showToast("Visa fee saved successfully", "success");
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to save visa fee";
      showToast(msg, "error");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitVisaFee, isSubmitting };
};
