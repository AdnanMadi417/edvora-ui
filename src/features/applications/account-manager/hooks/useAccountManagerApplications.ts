import { useEffect, useRef, useState, useCallback } from "react";
import api from "lib/useApi";

export type AccountManagerApplication = {
  id: string;
  updated_at: string;
  partner_id: string;
  partner_name: string;
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
  new_notifications_count: number;
};

export type AccountManagerApplicationsResponse = {
  total: number;
  limit: number;
  offset: number;
  items: AccountManagerApplication[];
};

export type UseAccountManagerApplicationsParams = {
  limit?: number;
  offset?: number;
  status?: "active" | "hold" | "cancel" | "all";
  partner_id?: string;
  stage_id?: string;
  stage_status_id?: string;
  search?: string;
  university_id?: string;
};

export function useAccountManagerApplications({
  limit = 20,
  offset = 0,
  status = "active",
  partner_id,
  stage_id,
  stage_status_id,
  search,
  university_id,
}: UseAccountManagerApplicationsParams = {}) {
  const [data, setData] = useState<AccountManagerApplicationsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only the newest request may update state: an older, slower response (a previous
  // page size, filter or search) must not overwrite a newer one.
  const latestRequest = useRef(0);

  const fetchApplications = useCallback(async () => {
    const request = ++latestRequest.current;
    setLoading(true);
    setError(null);

    try {
      const res = await api.get<AccountManagerApplicationsResponse>(
        "/account-managers/applications",
        {
          params: {
            limit, offset, status,
            ...(partner_id ? { partner_id } : {}),
            ...(stage_id ? { stage_id } : {}),
            ...(stage_status_id ? { stage_status_id } : {}),
            ...(search ? { search } : {}),
            ...(university_id ? { university_id } : {}),
          },
        }
      );

      if (request === latestRequest.current) setData(res.data);
    } catch (err) {
      console.error(err);
      if (request === latestRequest.current) setError("Failed to fetch applications");
    } finally {
      if (request === latestRequest.current) setLoading(false);
    }
  }, [limit, offset, status, partner_id, stage_id, stage_status_id, search, university_id]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

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
