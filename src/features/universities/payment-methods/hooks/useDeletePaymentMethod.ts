import { useState } from "react";
import { paymentMethodsApi } from "../services";
import { parseApiError } from "utils/parseApiError";

export function useDeletePaymentMethod() {
  const [isDeleting, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  const deletePayment = async (paymentId: string) => {
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      await paymentMethodsApi.delete(paymentId);
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
