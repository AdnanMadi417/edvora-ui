import { useState, useEffect } from 'react';
import { partnersApi } from '../services';
import type { Partner } from '../types';

const PAGE_SIZE = 100;

export function useAllPartners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [partnersLoading, setLoading] = useState(false);
  const [partnersError, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError('');
      try {
        const first = await partnersApi.list({ page: 1, page_size: PAGE_SIZE });
        const firstItems: Partner[] = first.data?.items ?? [];
        const total: number = first.data?.total ?? 0;
        const totalPages = Math.ceil(total / PAGE_SIZE);

        if (totalPages <= 1) {
          setPartners(firstItems);
          return;
        }

        const rest = await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, i) =>
            partnersApi.list({ page: i + 2, page_size: PAGE_SIZE })
          )
        );

        setPartners([...firstItems, ...rest.flatMap((r) => r.data?.items ?? [])]);
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
