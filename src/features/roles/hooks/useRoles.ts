import { useState, useEffect } from "react";
import { rolesApi } from "../services";
import type { Role } from "../types";

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refetchCounter, setRefetchCounter] = useState(0);

  const refetch = () => setRefetchCounter((c) => c + 1);

  useEffect(() => {
    setLoading(true);
    setError(null);

    rolesApi
      .list()
      .then((res) => setRoles(res.data ?? []))
      .catch(() => setError("Failed to fetch roles"))
      .finally(() => setLoading(false));
  }, [refetchCounter]);

  return { roles, loading, error, refetch };
}
