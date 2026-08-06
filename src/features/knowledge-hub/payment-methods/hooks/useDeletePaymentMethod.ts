import { useState } from "react";
import api from "lib/useApi";
import Cookies from "js-cookie";
import { parseApiError } from "utils/parseApiError";

export function useDeleteUniversity() {
  const [isDeleting, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  const deletePayment = async (paymentId: string) => {
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const token = Cookies.get("token");
      await api.delete(`/admin/payment-methods/${paymentId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setSuccess(true);
    } catch (err: unknown) {
      setError(parseApiError(err, "Failed to delete payment method"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deletePayment, isDeleting, error, success };
}
