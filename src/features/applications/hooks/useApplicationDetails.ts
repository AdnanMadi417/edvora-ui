import { useEffect, useState, useCallback } from "react";
import api from "lib/useApi";
import Cookies from "js-cookie";
import type { ApplicationDetail } from "features/applications/shared/applicationTypes";

export type ApplicationDetails = ApplicationDetail;

const useApplicationDetails = (applicationId?: string) => {
  const [data, setData] = useState<ApplicationDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = Cookies.get("token");

  const fetchApplicationDetails = useCallback(async () => {
    if (!applicationId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get<ApplicationDetails>(`/admin/applications/${applicationId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setData(response.data);
    } catch (err: any) {
      console.error("API error:", err);
      setError(err?.response?.data?.message || "Failed to fetch application details");
    } finally {
      setLoading(false);
    }
  }, [applicationId, token]);

  useEffect(() => {
    fetchApplicationDetails();
  }, [fetchApplicationDetails]);

  return { applications: data, loading, error, refetch: fetchApplicationDetails };
};

export default useApplicationDetails;
