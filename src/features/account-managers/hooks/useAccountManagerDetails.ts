import { useState, useEffect } from "react";
import { accountManagersApi } from "../services";
import type { AccountManager } from "../types";

export function useAccountManagerDetails(managerId: string) {
  const [manager, setManager] = useState<AccountManager | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!managerId) return;

    setLoading(true);
    setError(null);

    accountManagersApi
      .get(managerId)
      .then((res) => setManager(res.data))
      .catch(() => setError("Failed to fetch manager"))
      .finally(() => setLoading(false));
  }, [managerId]);

  return { manager, loading, error };
}
