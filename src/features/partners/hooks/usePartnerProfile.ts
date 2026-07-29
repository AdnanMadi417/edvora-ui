import { useState, useEffect } from 'react';
import { partnersApi } from '../services';
import type { PartnerDetails } from '../types';

export function usePartnerProfile({ enabled = true }: { enabled?: boolean } = {}) {
  const [partner, setPartner] = useState<PartnerDetails | null>(null);
  const [isPartnerLoading, setIsPartnerLoading] = useState(false);
  const [partnerError, setPartnerError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const fetch = async () => {
      setIsPartnerLoading(true);
      setPartnerError(null);
      try {
        const res = await partnersApi.getProfile();
        setPartner(res.data);
      } catch (err: any) {
        setPartnerError(err?.response?.data?.detail || 'Failed to fetch partner');
      } finally {
        setIsPartnerLoading(false);
      }
    };
    fetch();
  }, [enabled]);

  return { partner, isPartnerLoading, partnerError };
}
