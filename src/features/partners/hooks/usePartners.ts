import { useState, useEffect } from 'react';
import { partnersApi } from '../services';
import type { Partner } from '../types';

export function useAllPartners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [partnersLoading, setLoading] = useState(false);
  const [partnersError, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await partnersApi.list();
        setPartners(res.data || []);
      } catch {
        setError('Failed to fetch partners');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { partners, partnersLoading, partnersError };
}
