import { useEffect, useState } from "react";
import { payoutsApi } from "../services";
import type { Payout } from "../types";

export function usePartnerPayouts(
  partnerId: string | undefined,
  params?: { activeOnly?: boolean; latest?: boolean }
) {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refetchCounter, setRefetchCounter] = useState(0);

  const refetch = () => setRefetchCounter((c) => c + 1);

  useEffect(() => {
    if (!partnerId) {
      setPayouts([]);
      return;
    }

    let stale = false;
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await payoutsApi.list(partnerId, params);
        if (stale) return;
        const data: any = res.data;
        setPayouts(Array.isArray(data) ? data : (data?.items ?? []));
      } catch {
        if (stale) return;
        setError("Failed to fetch payouts");
      } finally {
        if (!stale) setLoading(false);
      }
    };

    fetch();
    return () => {
      stale = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerId, params?.activeOnly, params?.latest, refetchCounter]);

  return { payouts, loading, error, refetch };
}
