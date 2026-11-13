import { useState, useEffect } from 'react';
import { partnersApi } from '../../services';
import type { PendingRegistrationOtp, GetPendingRegistrationOtpsParams } from '../../types';

export function usePendingRegistrationOtps(params: GetPendingRegistrationOtpsParams = {}) {
  const [items, setItems] = useState<PendingRegistrationOtp[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refetchCounter, setRefetchCounter] = useState(0);

  const refetch = () => setRefetchCounter((c) => c + 1);
  // Refetch when the params' values change, not on every new object from the caller.
  const paramsKey = JSON.stringify(params);

  useEffect(() => {
    const query = JSON.parse(paramsKey) as typeof params;
    const fetch = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await partnersApi.getPendingRegistrationOtps(query);
        setItems(res.data?.items ?? []);
        setTotal(res.data?.total ?? 0);
      } catch {
        setError('Failed to fetch pending registrations');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [paramsKey, refetchCounter]);

  return { items, total, loading, error, refetch };
}
