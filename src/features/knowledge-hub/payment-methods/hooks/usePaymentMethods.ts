import { useState, useEffect } from "react";
import api from "lib/useApi";

export interface PaymentMethod {
  id: string;
  name: string;
  description?: string;
}

export function useAllPaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refetchCounter, setRefetchCounter] = useState(0);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/admin/payment-methods");
        setPaymentMethods(res.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch payment methods");
      } finally {
        setLoading(false);
      }
    };
    fetchPaymentMethods();
  }, [refetchCounter]);

  return { paymentMethods, loading, error, refetch: () => setRefetchCounter((c) => c + 1) };
}
