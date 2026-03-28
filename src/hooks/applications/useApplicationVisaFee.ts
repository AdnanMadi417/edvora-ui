import { useState, useEffect } from "react";
import api from "lib/useApi";
import Cookies from "js-cookie";

export function useApplicationVisaFee(applicationId: string) {
  const [visaFeeAmount, setVisaFeeAmount] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!applicationId) return;

    const fetch = async () => {
      setLoading(true);
      try {
        const token = Cookies.get("token");
        const { data } = await api.get(`/applications/${applicationId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setVisaFeeAmount(data.visa_fee_amount);
      } catch (err) {
        console.error("Failed to fetch visa fee", err);
        setError("Failed to fetch visa fee");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [applicationId]);

  return { visaFeeAmount, loading, error };
}
