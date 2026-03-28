import { useState, useEffect } from "react";
import api from "lib/useApi"; // your axios wrapper

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
}

export function usePaymentMethod(paymentMethodId: string | null) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!paymentMethodId) return;

    const fetchPaymentMethod = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await api.get(`/admin/payment-methods/${paymentMethodId}`);
        setPaymentMethod(res.data);
      } catch (err: any) {
        console.error(err);
        setError(err?.response?.data?.detail?.[0]?.msg || "Failed to fetch payment method");
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentMethod();
  }, [paymentMethodId]);

  return { paymentMethod, loading, error };
}