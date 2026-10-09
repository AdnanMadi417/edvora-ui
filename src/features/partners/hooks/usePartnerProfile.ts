import { useState, useEffect } from 'react';
import { partnersApi } from '../services';
import type { PartnerDetails } from '../types';
import { useSession } from 'components/context/SessionContext';

interface ProfileState {
  partner: PartnerDetails | null;
  isPartnerLoading: boolean;
  partnerError: string | null;
}

/**
 * The signed-in partner's profile. Inside a role layout this reads the
 * shared copy loaded once per page by SessionContext (so the layout, sidebar
 * and navbar no longer each call /partners/profile); `refetch` refreshes that
 * shared copy for everyone. Outside a layout it fetches on its own.
 */
export function usePartnerProfile({ enabled = true }: { enabled?: boolean } = {}) {
  const session = useSession();
  const hasProvider = session !== null;
  const [state, setState] = useState<ProfileState>({ partner: null, isPartnerLoading: false, partnerError: null });
  const [refetchCounter, setRefetchCounter] = useState(0);

  useEffect(() => {
    if (hasProvider || !enabled) return;
    let cancelled = false;
    const fetch = async () => {
      setState((s) => ({ ...s, isPartnerLoading: true, partnerError: null }));
      try {
        const res = await partnersApi.getProfile();
        if (!cancelled) setState({ partner: res.data, isPartnerLoading: false, partnerError: null });
      } catch (err: any) {
        if (!cancelled) {
          setState((s) => ({ ...s, isPartnerLoading: false, partnerError: err?.response?.data?.detail || 'Failed to fetch partner' }));
        }
      }
    };
    fetch();
    return () => {
      cancelled = true;
    };
  }, [hasProvider, enabled, refetchCounter]);

  if (session) {
    return {
      partner: session.partner,
      isPartnerLoading: session.isPartnerLoading,
      partnerError: session.partnerError,
      refetch: session.refetchPartner,
    };
  }

  return { ...state, refetch: () => setRefetchCounter((c) => c + 1) };
}
