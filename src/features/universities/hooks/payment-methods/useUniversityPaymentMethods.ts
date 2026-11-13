import { useState, useEffect, useCallback } from "react";
import { universityApi } from "../../services";
import type { UniversityPaymentMethod } from "../../types";

export function useUniversityPaymentMethods(universityId?: string) {
  const [universityPaymentMethods, setPaymentMethods] = useState<UniversityPaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUniversityPaymentMethods = useCallback(async () => {
    if (!universityId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await universityApi.paymentMethods.list(universityId);
      setPaymentMethods(res.data);
      return res.data;
    } catch (err: any) {
      setError("Failed to fetch university payment methods.");
    } finally {
      setLoading(false);
    }
  }, [universityId]);

  useEffect(() => {
    fetchUniversityPaymentMethods();
  }, [fetchUniversityPaymentMethods]);

  return { universityPaymentMethods, loading, error, refetch: fetchUniversityPaymentMethods };
}
