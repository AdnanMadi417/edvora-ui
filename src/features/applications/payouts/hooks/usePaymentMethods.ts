import { useEffect, useState } from "react";
import { paymentMethodsApi } from "../services";
import type { PaymentMethod } from "../types";
import { parseApiError } from "utils/parseApiError";

export function usePaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    paymentMethodsApi
      .list()
      .then((res) => {
        if (!cancelled) setPaymentMethods(res.data ?? []);
      })
      .catch((err) => {
        if (!cancelled) setError(parseApiError(err, "Failed to fetch payment methods"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { paymentMethods, loading, error };
}
