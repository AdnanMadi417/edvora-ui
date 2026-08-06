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
    const fetch = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await partnersApi.listForAccountManager(params);
        setPartners(res.data?.items ?? []);
        setTotal(res.data?.total ?? 0);
      } catch {
        setError('Failed to fetch partners');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [JSON.stringify(params), refetchCounter]);

  return { partners, total, loading, error, refetch };
}
