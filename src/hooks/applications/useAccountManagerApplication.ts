import { useState, useEffect } from "react";
import api from "../../lib/useApi";

export interface Application {
  id: string;
  is_draft: boolean;
  lifecycle_status: string;
  intake_date: string;
  created_at: string;
  updated_at: string;
  partner: { id: string; name: string };
  program: any;
  student: any;
  stage: any;
  documents: any[];
  commissions: any[];
  payment_documents: any[];
  arrival_documents: any[];
  offer_letter_document: any;
  visa_document: any;
}

interface UseAccountManagerApplicationProps {
  managerId: string;
  applicationId: string;
}

interface UseAccountManagerApplicationReturn {
  data: Application | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useAccountManagerApplication = ({
                                               managerId,
                                               applicationId,
                                             }: UseAccountManagerApplicationProps): UseAccountManagerApplicationReturn => {
  const [data, setData] = useState<Application | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApplication = async () => {
    if (!managerId || !applicationId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await api.get<Application>(
        `/account-managers/${managerId}/applications/${applicationId}`
      );

      setData(response.data);
    } catch (err: any) {
      console.error("Failed to fetch application:", err);
      setError(err?.response?.data?.message || "Failed to fetch application");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [managerId, applicationId]);

  return { data, loading, error, refetch: fetchApplication };
};