import { useState, useEffect } from 'react';
import { partnersApi } from '../services';
import type { AccountManagerPartnerDetails } from '../types';

export function useAccountManagerPartnerDetails(partnerId: string) {
  const [partner, setPartner] = useState<AccountManagerPartnerDetails | null>(null);
  const [isPartnerLoading, setIsPartnerLoading] = useState(false);
  const [partnerError, setPartnerError] = useState<string | null>(null);
  const [refetchCounter, setRefetchCounter] = useState(0);

  const refetch = () => setRefetchCounter((c) => c + 1);

  useEffect(() => {
    if (!partnerId) return;

    const fetch = async () => {
      setIsPartnerLoading(true);
      setPartnerError(null);
      try {
        const res = await partnersApi.getForAccountManager(partnerId);
        setPartner(res.data);
      } catch (err: any) {
        setPartnerError(err?.response?.data?.detail || 'Failed to fetch partner');
      } finally {
        setIsPartnerLoading(false);
      }
    };
    fetch();
  }, [partnerId, refetchCounter]);

  return { partner, isPartnerLoading, partnerError, refetch };
}
