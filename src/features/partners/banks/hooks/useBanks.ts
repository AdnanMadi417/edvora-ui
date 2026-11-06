import { useCallback, useEffect, useState, useRef } from "react";
import { banksApi } from "../services";
import type { Bank, BanksListParams } from "../types";
import { parseApiError } from "utils/parseApiError";

export function useBanks(params?: BanksListParams) {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Re-run whenever a filter value actually changes, not on every render —
  // params is a fresh object literal from the caller each time.
  const country = params?.country;
  const includeInactive = params?.include_inactive;

  const requestVersion = useRef(0);
  const fetchBanks = useCallback(() => {
    const version = ++requestVersion.current;
    setLoading(true);
    setError(null);
    return banksApi
      .list({ country, include_inactive: includeInactive })
      .then((res) => {
        if (version === requestVersion.current) setBanks(res.data ?? []);
      })
      .catch((err) => {
        if (version === requestVersion.current)
          setError(parseApiError(err, "Failed to fetch banks"));
      })
      .finally(() => {
        if (version === requestVersion.current) setLoading(false);
      });
  }, [country, includeInactive]);

  useEffect(() => {
    fetchBanks();
    return () => {
      requestVersion.current += 1;
    };
  }, [fetchBanks]);

  return { banks, loading, error, refetch: fetchBanks };
}
