import { useState, useEffect } from "react";
import { agencyMembersApi } from "../services";
import type { AgencyInvitation } from "../types";

export type GetAgencyInvitationsParams = {
  search?: string;
  progress?: string;
  page?: number;
  page_size?: number;
};

export function useAgencyInvitations({
  search,
  progress,
  page = 1,
  page_size = 20,
}: GetAgencyInvitationsParams = {}) {
  const [invitations, setInvitations] = useState<AgencyInvitation[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refetchCounter, setRefetchCounter] = useState(0);

  const refetch = () => setRefetchCounter((c) => c + 1);

  useEffect(() => {
    setLoading(true);
    setError(null);

    agencyMembersApi
      .listInvitations({ search: search || undefined, progress: progress || undefined, page, page_size })
      .then((res) => {
        setInvitations(res.data?.items ?? []);
        setTotal(res.data?.total ?? 0);
      })
      .catch(() => setError("Failed to fetch invitations"))
      .finally(() => setLoading(false));
  }, [search, progress, page, page_size, refetchCounter]);

  return { invitations, total, loading, error, refetch };
}
