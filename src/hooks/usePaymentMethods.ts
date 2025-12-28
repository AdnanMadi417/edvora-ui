import { useState, useEffect } from "react";
import api from "lib/useApi";
import Cookies from "js-cookie";

export type VisaPaymentMethod = {
  id: string;
  name: string;
  instructions: string;
  currency: string;
};

export function useVisaPaymentMethods(applicationId: string) {
  const [methods, setMethods] = useState<VisaPaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!applicationId) return;

    const fetchMethods = async () => {
      setLoading(true);
      try {
        const token = Cookies.get("token");

        const res = await api.get(
          `/applications/${applicationId}/university-payment-methods`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );

        setMethods(res.data || []);
      } catch (err) {
        setError("Failed to fetch payment methods");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMethods();
  }, [applicationId]);

  return { methods, loading, error };
}
