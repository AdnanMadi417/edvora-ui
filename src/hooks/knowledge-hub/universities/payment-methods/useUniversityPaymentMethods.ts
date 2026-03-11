"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import api from "lib/useApi";

export interface UniversityPaymentMethod {
  id: string;
  university_id: string;
  payment_method_id: string;
  payment_method_name: string;
  instructions?: string;
  currency?: string;
  is_active: boolean;
}

export const useUniversityPaymentMethods = (universityId?: string) => {
  const [universityPaymentMethods, setPaymentMethods] = useState<
    UniversityPaymentMethod[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUniversityPaymentMethods = async () => {
    if (!universityId) return;

    try {
      setLoading(true);
      setError(null);

      const token = Cookies.get("token");

      const res = await api.get(
        `/admin/universities/${universityId}/payment-methods`,
        {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
        }
      );

      setPaymentMethods(res.data);

      return res.data;

    } catch (err: any) {
      console.error("Fetch university payment methods error:", err);
      setError("Failed to fetch university payment methods.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversityPaymentMethods();
  }, [universityId]);

  return {
    universityPaymentMethods,
    loading,
    error,
    refetch: fetchUniversityPaymentMethods,
  };
};