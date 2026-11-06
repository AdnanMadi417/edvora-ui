import { useState, useEffect } from "react";
import { paymentMethodsApi } from "../services";

import type { PaymentMethod } from "../types";
export type { PaymentMethod } from "../types";

export function usePaymentMethod(paymentMethodId: string | null) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!paymentMethodId) return;
    const fetchPaymentMethod = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await paymentMethodsApi.get(paymentMethodId);
        setPaymentMethod(res.data);
      } catch (err: any) {
        setError(
          err?.response?.data?.detail?.[0]?.msg ||
            "Failed to fetch payment method"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchPaymentMethod();
  }, [paymentMethodId]);

  return { paymentMethod, loading, error };
}
