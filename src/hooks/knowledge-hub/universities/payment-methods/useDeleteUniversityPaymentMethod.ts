import { useState } from "react";
import api from "lib/useApi";
import Cookies from "js-cookie";

export function useDeleteUniversityPaymentMethod() {
  const [isDeleting, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  const deleteUniPayment = async (universityId: string, methodId: string) => {
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const token = Cookies.get("token");

      await api.delete(
        `/admin/universities/${universityId}/payment-methods/${methodId}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      setSuccess(true);

    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.detail?.[0]?.msg ||
        "Failed to delete university payment method",
      );

      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteUniPayment,
    isDeleting,
    error,
    success,
  };
}