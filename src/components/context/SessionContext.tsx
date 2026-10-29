"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from "react";
import { partnersApi } from "features/partners/services";
import type { PartnerDetails } from "features/partners/types";
import { mockUser, MOCK_PARTNER } from "config/mockSession";

/**
 * The session shared by everything under a role layout. UI-only mode: there
 * is no sign-in, so the user is a mock of the layout's role (see
 * config/mockSession.ts) and is ready immediately.
 */

export interface AgencyMembership {
  agency_id: string;
  agency_name: string;
}

export interface SessionUser {
  id: string;
  partner_id?: string | null;
  name: string;
  email: string;
  role: string;
  has_completed_onboarding?: boolean;
  agency_role?: string | null;
  agency_membership?: AgencyMembership | null;
}

export type SessionStatus = "loading" | "ready";

export interface SessionContextValue {
  status: SessionStatus;
  user: SessionUser | null;
  partner: PartnerDetails | null;
  isPartnerLoading: boolean;
  partnerError: string | null;
  refetchPartner: () => void;
}

export const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ role, children }: { role: string; children: ReactNode }) {
  const user = useMemo(() => mockUser(role), [role]);
  const status: SessionStatus = "ready";

  // Partner profile, loaded once per page for partners only.
  const isPartner = user.role === "partner";
  const [partner, setPartner] = useState<PartnerDetails | null>(null);
  const [isPartnerLoading, setIsPartnerLoading] = useState(false);
  const partnerError: string | null = null;
  const [partnerRound, setPartnerRound] = useState(0);
  const partnerChainRef = useRef<{ key: string; promise: Promise<{ data: PartnerDetails }> } | null>(null);

  useEffect(() => {
    if (!isPartner) return;
    let cancelled = false;
    const key = `${user.id}:${partnerRound}`;
    if (!partnerChainRef.current || partnerChainRef.current.key !== key) {
      partnerChainRef.current = { key, promise: partnersApi.getProfile() };
    }
    setIsPartnerLoading(true);
    partnerChainRef.current.promise
      .then((res) => {
        if (!cancelled) setPartner(res.data);
      })
      // No backend (or no session on it): fall back to the mock partner.
      .catch(() => {
        if (!cancelled) setPartner(MOCK_PARTNER);
      })
      .finally(() => {
        if (!cancelled) setIsPartnerLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isPartner, user.id, partnerRound]);

  const refetchPartner = useCallback(() => setPartnerRound((r) => r + 1), []);

  const value = useMemo<SessionContextValue>(
    () => ({ status, user, partner, isPartnerLoading, partnerError, refetchPartner }),
    [status, user, partner, isPartnerLoading, partnerError, refetchPartner],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

/** The shared session, or null when rendered outside a role layout. */
export function useSession(): SessionContextValue | null {
  return useContext(SessionContext);
}
