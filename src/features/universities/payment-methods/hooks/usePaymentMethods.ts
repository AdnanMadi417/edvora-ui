import { useState, useEffect } from "react";
import { paymentMethodsApi } from "../services";

import type { PaymentMethod } from "../types";
export type { PaymentMethod } from "../types";

export function useAllPaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchCounter, setRefetchCounter] = useState(0);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await paymentMethodsApi.list();
        setPaymentMethods(res.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch payment methods");
      } finally {
        setLoading(false);
      }
    };
    fetchPaymentMethods();
  }, [refetchCounter]);

  return {
    paymentMethods,
    loading,
    error,
    refetch: () => setRefetchCounter((c) => c + 1),
  };
}
