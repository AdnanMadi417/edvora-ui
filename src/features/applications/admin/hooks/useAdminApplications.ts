import { useEffect, useRef, useState } from "react";
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
  student_photo_file_key?: string;
  student_photo_file_url?: string;
  stage: string;
  status: string;
  next_action: string;
  lifecycle_status: string;
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
  stage_id?: string;
  stage_status_id?: string;
  partner_id?: string;
  search?: string;
};


export function useAdminApplications({
                                       limit = 20,
                                       offset = 0,
                                       status = "active",
                                       stage_id,
                                       stage_status_id,
                                       partner_id,
                                       search,
                                     }: UseAdminApplicationsParams = {}) {
  const [data, setData] = useState<AdminApplicationsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only the newest request may update state: an older, slower response (a previous
  // page size, filter or search) must not overwrite a newer one.
  const latestRequest = useRef(0);

  const fetchApplications = async () => {
    const request = ++latestRequest.current;
    setLoading(true);
    setError(null);

    try {
      const token = Cookies.get("token");

      const res = await api.get<AdminApplicationsResponse>(
        "/admin/applications",
        {
          params: {
            limit, offset, status,
            ...(stage_id ? { stage_id } : {}),
            ...(stage_status_id ? { stage_status_id } : {}),
            ...(partner_id ? { partner_id } : {}),
            ...(search ? { search } : {}),
          },
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
        }
      );

      if (request === latestRequest.current) setData(res.data);
    } catch (err) {
      console.error(err);
      if (request === latestRequest.current) setError("Failed to fetch admin applications");
    } finally {
      if (request === latestRequest.current) setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [limit, offset, status, stage_id, stage_status_id, partner_id, search]);

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
