import { useState } from "react";
import { paymentMethodsApi } from "../services";
import { parseApiError } from "utils/parseApiError";

import type { PaymentMethodPayload as CreatePaymentPayload } from "../types";

export function useCreatePayment() {
  const [paymentLoading, setLoading] = useState<boolean>(false);
  const [paymentError, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  const createPayment = async (payload: CreatePaymentPayload) => {
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const response = await paymentMethodsApi.create(payload);
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
