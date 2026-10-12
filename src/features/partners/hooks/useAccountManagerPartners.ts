import { useState, useEffect } from 'react';
import { partnersApi } from '../services';
import type { AccountManagerPartnerListItem } from '../types';

export type UseAccountManagerPartnersParams = {
  limit?: number;
  offset?: number;
  search?: string;
};

export function useAccountManagerPartners(params: UseAccountManagerPartnersParams = {}) {
  const [partners, setPartners] = useState<AccountManagerPartnerListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refetchCounter, setRefetchCounter] = useState(0);

  const refetch = () => setRefetchCounter((c) => c + 1);

  useEffect(() => {
    // Only the latest request may touch state. Without this, a slower
    // response for an earlier search term could land after the newer one
    // and overwrite it with stale rows.
    const controller = new AbortController();
    let stale = false;
    const fetch = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await partnersApi.listForAccountManager(params, controller.signal);
        if (stale) return;
        setPartners(res.data?.items ?? []);
        setTotal(res.data?.total ?? 0);
      } catch {
        if (stale) return;
        setError('Failed to fetch partners');
      } finally {
        if (!stale) setLoading(false);
      }
    };
    fetch();
    return () => {
      stale = true;
      controller.abort();
    };
  }, [JSON.stringify(params), refetchCounter]);

  return { partners, total, loading, error, refetch };
}
