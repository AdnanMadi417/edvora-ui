import { useState, useEffect } from "react";
import api from "lib/useApi";
import Cookies from "js-cookie";

export type VisaPaymentDocument = {
  id: string;
  file_key: string;
  file_url: string;
};

export type VisaPayment = {
  id: string;
  visa_case_id: string;
  university_payment_method_id: string;
  amount: string;
  currency: string;
  payment_reference: string;
  status: string;
  submitted_at: string;
  reviewed_at?: string;
  review_notes?: string;
  created_at: string;
  updated_at: string;
  documents: VisaPaymentDocument[];
};

export function useVisaPayments(applicationId: string) {
  const [payments, setPayments] = useState<VisaPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!applicationId) return;

    const fetchVisaPayments = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = Cookies.get("token");

        const res = await api.get(
          `/applications/${applicationId}/visa-payments`,
          {
            headers: token
              ? { Authorization: `Bearer ${token}` }
              : {},
          }
        );

        setPayments(res.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch visa payments");
      } finally {
        setLoading(false);
      }
    };

    fetchVisaPayments();
  }, [applicationId]);

  return { payments, loading, error };
}