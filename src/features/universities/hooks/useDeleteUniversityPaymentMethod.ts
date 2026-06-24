import { useState } from "react";
import { universityApi } from "../services";

export function useDeleteUniversityPaymentMethod() {
  const [isDeleting, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const deleteUniversityPaymentMethod = async (universityId: string, methodId: string) => {
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      await universityApi.paymentMethods.delete(universityId, methodId);
      setSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.detail?.[0]?.msg || "Failed to delete university payment method");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteUniversityPaymentMethod, isDeleting, error, success };
}
