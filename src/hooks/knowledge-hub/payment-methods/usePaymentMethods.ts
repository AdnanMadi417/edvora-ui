import { useState, useEffect } from "react";
import api from "../../../lib/useApi";

export interface PaymentMethod {
  id: string;
  name: string;
  description?: string;
}

export function useAllPaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      setLoading(true);
      setError(null);

      try {
        const uniRes = await api.get(`/admin/payment-methods`);
        setPaymentMethods(uniRes.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch PaymentMethods");
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentMethods();
  }, []);

  return { paymentMethods, loading, error };
}
