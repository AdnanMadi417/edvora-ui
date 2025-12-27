import { useState, useEffect } from "react";
import api from "lib/useApi";
import Cookies from "js-cookie";

export type VisaCase = {
  id: string;
  application_id: string;
  visa_fee_amount: string;
  visa_reference_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export function useVisaCase(applicationId: string) {
  const [visaCase, setVisaCase] = useState<VisaCase | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!applicationId) return;

    const fetchVisaCase = async () => {
      setLoading(true);
      try {
        const token = Cookies.get("token");
        const res = await api.get(`/applications/${applicationId}/visa-case`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setVisaCase(res.data);
      } catch (err) {
        setError("Failed to fetch visa case");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVisaCase();
  }, [applicationId]);

  return { visaCase, loading, error };
}
