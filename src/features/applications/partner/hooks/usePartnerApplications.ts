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
  lifecycle_status: string;
  new_notifications_count: number;
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
  stage_id?: string;
  stage_status_id?: string;
  search?: string;
  university_id?: string;
};

export function usePartnerApplications({
  partnerId,
  limit = 20,
  offset = 0,
  status = "active",
  stage_id,
  stage_status_id,
  search,
  university_id,
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
          params: {
            limit, offset, status,
            ...(stage_id ? { stage_id } : {}),
            ...(stage_status_id ? { stage_status_id } : {}),
            ...(search ? { search } : {}),
            ...(university_id ? { university_id } : {}),
          },
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
  }, [partnerId, limit, offset, status, stage_id, stage_status_id, search, university_id]);

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
