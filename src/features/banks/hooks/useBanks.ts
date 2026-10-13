import { useCallback, useEffect, useState } from "react";
import { banksApi } from "../services";
import type { Bank, BanksListParams } from "../types";
import { parseApiError } from "utils/parseApiError";

export function useBanks(params?: BanksListParams) {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Re-run whenever a filter value actually changes, not on every render —
  // params is a fresh object literal from the caller each time.
  const country = params?.country;
  const includeInactive = params?.include_inactive;

  const fetchBanks = useCallback(() => {
    setLoading(true);
    setError(null);
    return banksApi
      .list({ country, include_inactive: includeInactive })
      .then((res) => setBanks(res.data ?? []))
      .catch((err) => setError(parseApiError(err, "Failed to fetch banks")))
      .finally(() => setLoading(false));
  }, [country, includeInactive]);

  useEffect(() => {
    fetchBanks();
  }, [fetchBanks]);

  return { banks, loading, error, refetch: fetchBanks };
}
