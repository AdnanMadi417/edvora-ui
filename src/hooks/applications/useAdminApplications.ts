import { useEffect, useState } from "react";
import api from "lib/useApi";
import Cookies from "js-cookie";

export type AdminApplication = {
  id: string;
  updated_at: string;
  partner_id: string;
  partner_name: string;
  account_manager_name: string;
  program_name: string;
  university_name: string;
  student_name: string;
  student_email: string;
  passport_number?: string;
  stage: string;
  status: string;
  next_action: string;
  lifecycle_status: "active" | "hold" | "cancel";
};

export type AdminApplicationsResponse = {
  total: number;
  limit: number;
  offset: number;
  items: AdminApplication[];
};

export type UseAdminApplicationsParams = {
  limit?: number;
  offset?: number;
  status?: "active" | "hold" | "cancel" | "all";
};


export function useAdminApplications({
                                       limit = 20,
                                       offset = 0,
                                       status = "active",
                                     }: UseAdminApplicationsParams = {}) {
  const [data, setData] = useState<AdminApplicationsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = Cookies.get("token");

      const res = await api.get<AdminApplicationsResponse>(
        "/admin/applications",
        {
          params: { limit, offset, status },
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
        }
      );

      setData(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch admin applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [limit, offset, status]);

  return {
    items: data?.items ?? [],
    total: data?.total ?? 0,
    limit: data?.limit ?? limit,
    offset: data?.offset ?? offset,
    loading,
    error,
    refetch: fetchApplications,
  };
}
