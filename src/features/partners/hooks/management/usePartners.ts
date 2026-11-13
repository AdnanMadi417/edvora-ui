import { useState, useEffect } from 'react';
import { partnersApi } from '../../services';
import type { Partner } from '../../types';

export type PartnersStats = {
  total: number;
  verified: number;
  unverified: number;
  active: number;
  inactive: number;
  individual: number;
  agency: number;
};

export type GetPartnersParams = {
  page?: number;
  page_size?: number;
  search?: string;
  is_verified?: boolean;
  is_active?: boolean;
  type?: string;
  assigned_manager_id?: string;
  /** Primary OR shared access (UBX-324); assigned_manager_id stays primary-only. */
  manager_id?: string;
};

export function usePartners(params: GetPartnersParams = {}) {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<PartnersStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refetchCounter, setRefetchCounter] = useState(0);

  const refetch = () => setRefetchCounter((c) => c + 1);
  // Refetch when the params' values change, not on every new object from the caller.
  const paramsKey = JSON.stringify(params);

  useEffect(() => {
    const query = JSON.parse(paramsKey) as typeof params;
    // Only the latest request may touch state. Without this, a slower
    // response for an earlier search term could land after the newer one
    // and overwrite it with stale rows.
    const controller = new AbortController();
    let stale = false;
    const fetch = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await partnersApi.list(query, controller.signal);
        if (stale) return;
        setPartners(res.data?.items ?? []);
        setTotal(res.data?.total ?? 0);
        setStats(res.data?.stats ?? null);
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
  }, [paramsKey, refetchCounter]);

  return { partners, total, stats, loading, error, refetch };
}

/** @deprecated Use usePartners instead */
export function useAllPartners() {
  const { partners, loading: partnersLoading, error: partnersError, refetch } = usePartners({ page: 1, page_size: 100 });
  return { partners, partnersLoading, partnersError, refetch };
}
