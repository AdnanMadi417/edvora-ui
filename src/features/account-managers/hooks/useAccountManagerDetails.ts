import { useState, useEffect, useRef } from "react";
import { accountManagersApi } from "../services";
import type { AccountManager } from "../types";

export function useAccountManagerDetails(managerId: string) {
  const [manager, setManager] = useState<AccountManager | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refetchCounter, setRefetchCounter] = useState(0);
  // Only the first load shows the page-level spinner; a refetch (e.g. after a
  // partner transfer) updates counts in place without unmounting the tabs.
  const hasLoadedRef = useRef(false);

  const refetch = () => setRefetchCounter((c) => c + 1);

  useEffect(() => {
    if (!managerId) return;
    let cancelled = false;

    if (!hasLoadedRef.current) setLoading(true);
    setError(null);

    accountManagersApi
      .get(managerId)
      .then((res) => {
        if (cancelled) return;
        setManager(res.data);
        hasLoadedRef.current = true;
      })
      .catch(() => {
        if (!cancelled) setError("Failed to fetch manager");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [managerId, refetchCounter]);

  return { manager, loading, error, refetch };
}
