import { useState, useEffect, useCallback } from "react";
import api from "lib/useApi";
import type { ApplicationDetail } from "features/applications/shared/applicationTypes";

export type Application = ApplicationDetail;

interface UseAccountManagerApplicationProps {
  applicationId: string;
}

interface UseAccountManagerApplicationReturn {
  data: Application | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useAccountManagerApplication = ({
  applicationId,
}: UseAccountManagerApplicationProps): UseAccountManagerApplicationReturn => {
  const [data, setData] = useState<Application | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApplication = useCallback(async () => {
    if (!applicationId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await api.get<Application>(
        `/account-managers/applications/${applicationId}`
      );

      setData(response.data);
    } catch (err: any) {
      console.error("Failed to fetch application:", err);
      setError(err?.response?.data?.message || "Failed to fetch application");
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  return { data, loading, error, refetch: fetchApplication };
};
