import { useState, useEffect } from "react";
import { staffUsersApi } from "../services";
import type { StaffUser, ListStaffUsersParams } from "../types";

export function useStaffUsers({
  role,
  is_active,
  search,
  page = 1,
  page_size = 20,
}: ListStaffUsersParams = {}) {
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refetchCounter, setRefetchCounter] = useState(0);

  const refetch = () => setRefetchCounter((c) => c + 1);

  useEffect(() => {
    setLoading(true);
    setError(null);

    staffUsersApi
      .list({ role, is_active, search: search || undefined, page, page_size })
      .then((res) => {
        setStaffUsers(res.data?.items ?? []);
        setTotal(res.data?.total ?? 0);
      })
      .catch(() => setError("Failed to fetch staff users"))
      .finally(() => setLoading(false));
  }, [role, is_active, search, page, page_size, refetchCounter]);

  return { staffUsers, total, loading, error, refetch };
}
