import { useState, useEffect } from "react";
import { agencyMembersApi } from "../services";
import type { AgencyMember } from "../types";

export type GetAgencyMembersParams = {
  search?: string;
  is_active?: boolean;
  commission_visible?: boolean;
  page?: number;
  page_size?: number;
  /** Skips the fetch entirely -- the backend endpoint is agency-admin-only
   *  and 403s for anyone else, which the global axios interceptor treats as
   *  a reason to bounce the whole page. Defaults to true so existing
   *  agency-admin-only callers are unaffected. */
  enabled?: boolean;
};

export function useAgencyMembers({
  search,
  is_active,
  commission_visible,
  page = 1,
  page_size = 20,
  enabled = true,
}: GetAgencyMembersParams = {}) {
  const [members, setMembers] = useState<AgencyMember[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refetchCounter, setRefetchCounter] = useState(0);

  const refetch = () => setRefetchCounter((c) => c + 1);

  useEffect(() => {
    if (!enabled) return;
    setLoading(true);
    setError(null);

    agencyMembersApi
      .listMembers({ search: search || undefined, is_active, commission_visible, page, page_size })
      .then((res) => {
        setMembers(res.data?.items ?? []);
        setTotal(res.data?.total ?? 0);
      })
      .catch(() => setError("Failed to fetch agency members"))
      .finally(() => setLoading(false));
  }, [search, is_active, commission_visible, page, page_size, enabled, refetchCounter]);

  return { members, total, loading, error, refetch };
}
