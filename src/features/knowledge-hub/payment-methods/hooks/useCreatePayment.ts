import { useState } from "react";
import api from "lib/useApi";
import Cookies from "js-cookie";
import { parseApiError } from "utils/parseApiError";

interface CreatePaymentPayload {
  name: string;
  description: string;
}

export function useCreatePayment() {
  const [paymentLoading, setLoading] = useState<boolean>(false);
  const [paymentError, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  const createPayment = async (payload: CreatePaymentPayload) => {
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const token = Cookies.get("token");
      const response = await api.post("/admin/payment-methods", payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setSuccess(true);
      return response.data;
    } catch (err: unknown) {
      setError(parseApiError(err, "Failed to create payment"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createPayment, paymentLoading, paymentError, success };
}
