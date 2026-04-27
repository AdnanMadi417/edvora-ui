import { useEffect, useState } from "react";
import api from "lib/useApi";
import Cookies from "js-cookie";

export type PartnerApplication = {
  id: string;
  updated_at: string;
  program_name: string;
  university_name: string;
  student_name: string;
  student_email: string;
  passport_number?: string;
  student_photo_file_key?: string;
  student_photo_file_url?: string;
  stage: string;
  status: string;
  next_action: string;
  lifecycle_status: "active" | "hold" | "cancel";
};

export type PartnerApplicationsResponse = {
  total: number;
  limit: number;
  offset: number;
  items: PartnerApplication[];
};

export type UsePartnerApplicationsParams = {
  partnerId: string;
  limit?: number;
  offset?: number;
  status?: "active" | "hold" | "cancel" | "all";
};

export function usePartnerApplications({
                                         partnerId,
                                         limit = 20,
                                         offset = 0,
                                         status = "active",
                                       }: UsePartnerApplicationsParams) {
  const [data, setData] = useState<PartnerApplicationsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = async () => {
    if (!partnerId) return;

    setLoading(true);
    setError(null);

    try {
      const token = Cookies.get("token");

      const res = await api.get<PartnerApplicationsResponse>(
        `/partners/${partnerId}/applications`,
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
      setError("Failed to fetch partner applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [partnerId, limit, offset, status]);

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