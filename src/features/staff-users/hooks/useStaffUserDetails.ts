import { useState, useEffect } from "react";
import { staffUsersApi } from "../services";
import type { StaffUser } from "../types";

export function useStaffUserDetails(userId?: string) {
  const [staffUser, setStaffUser] = useState<StaffUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refetchCounter, setRefetchCounter] = useState(0);

  const refetch = () => setRefetchCounter((c) => c + 1);

  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    staffUsersApi
      .get(userId)
      .then((res) => setStaffUser(res.data))
      .catch(() => setError("Failed to fetch staff user"))
      .finally(() => setLoading(false));
  }, [userId, refetchCounter]);

  return { staffUser, loading, error, refetch };
}
