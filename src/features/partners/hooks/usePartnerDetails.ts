import { useState, useEffect } from 'react';
import { partnersApi } from '../services';
import type { PartnerDetails } from '../types';

export function usePartnerDetails(partnerId: string) {
  const [partner, setPartner] = useState<PartnerDetails | null>(null);
  const [isPartnerLoading, setIsPartnerLoading] = useState(false);
  const [partnerError, setPartnerError] = useState<string | null>(null);

  useEffect(() => {
    if (!partnerId) return;

    const fetch = async () => {
      setIsPartnerLoading(true);
      setPartnerError(null);
      try {
        const res = await partnersApi.get(partnerId);
        setPartner(res.data);
      } catch (err: any) {
        setPartnerError(err?.response?.data?.detail || 'Failed to fetch partner');
      } finally {
        setIsPartnerLoading(false);
      }
    };
    fetch();
  }, [partnerId]);

  return { partner, isPartnerLoading, partnerError };
}
