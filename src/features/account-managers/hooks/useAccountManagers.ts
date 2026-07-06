import { useState, useEffect } from "react";
import { accountManagersApi } from "../services";
import type { AccountManager } from "../types";

export type GetAccountManagersParams = {
  page?: number;
  page_size?: number;
  search?: string;
  is_active?: boolean;
};

export function useAccountManagers({
  page = 1,
  page_size = 100,
  search,
  is_active,
}: GetAccountManagersParams = {}) {
  const [accountManagers, setAccountManagers] = useState<AccountManager[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refetchCounter, setRefetchCounter] = useState(0);

  const refetch = () => setRefetchCounter((c) => c + 1);

  useEffect(() => {
    setLoading(true);
    setError(null);

    accountManagersApi
      .list({ page, page_size, search: search || undefined, is_active })
      .then((res) => {
        setAccountManagers(res.data?.items ?? []);
        setTotal(res.data?.total ?? 0);
      })
      .catch(() => setError("Failed to fetch account managers"))
      .finally(() => setLoading(false));
  }, [page, page_size, search, is_active, refetchCounter]);

  return { accountManagers, total, loading, error, refetch };
}
