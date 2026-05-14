import { useState, useEffect } from "react";
import { accountManagersApi } from "../services";
import type { AccountManager } from "../types";

export function useAccountManagers() {
  const [accountManagers, setAccountManagers] = useState<AccountManager[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    accountManagersApi
      .list()
      .then((res) => setAccountManagers(res.data))
      .catch(() => setError("Failed to fetch account managers"))
      .finally(() => setLoading(false));
  }, []);

  return { accountManagers, loading, error };
}
