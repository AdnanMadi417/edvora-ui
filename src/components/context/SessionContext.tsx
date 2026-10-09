"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from "react";
import api from "lib/useApi";
import { classifyRequestError, requestErrorStatus, AuthFailureKind } from "lib/authFailure";
import { partnersApi } from "features/partners/services";
import type { PartnerDetails } from "features/partners/types";
import { parseApiError } from "utils/parseApiError";

/**
 * One session check per page, shared by everything under a role layout
 * (UBX-423). RoleGuard mounts this provider; the guard, sidebar, navbar,
 * onboarding tour and the partner hooks all read from it instead of each
 * calling /auth/me (and, for partners, /partners/profile) themselves.
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

export type SessionStatus = "loading" | "ready" | AuthFailureKind;

export interface SessionFailure {
  kind: AuthFailureKind;
  /** HTTP status of the last attempt, or null when no response was received. */
  status: number | null;
  /** Number of /auth/me attempts made in this round, including automatic retries. */
  attempts: number;
}

export interface SessionContextValue {
  status: SessionStatus;
  user: SessionUser | null;
  failure: SessionFailure | null;
  /** Starts a new round of session checks (manual Retry). */
  retry: () => void;
  partner: PartnerDetails | null;
  isPartnerLoading: boolean;
  partnerError: string | null;
  refetchPartner: () => void;
}

/** Automatic retry delays for "unavailable" failures. Three retries, then the user decides. */
export const SESSION_RETRY_DELAYS_MS = [1000, 2000, 4000];

export const SessionContext = createContext<SessionContextValue | null>(null);

type SessionOutcome = { user: SessionUser } | { failure: SessionFailure };

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

async function runSessionCheck(): Promise<SessionOutcome> {
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await api.get("/auth/me");
      return { user: res.data as SessionUser };
    } catch (err) {
      const kind = classifyRequestError(err);
      const attempts = attempt + 1;
      if (kind !== "unavailable" || attempt >= SESSION_RETRY_DELAYS_MS.length) {
        return { failure: { kind, status: requestErrorStatus(err), attempts } };
      }
      await sleep(SESSION_RETRY_DELAYS_MS[attempt]);
    }
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [user, setUser] = useState<SessionUser | null>(null);
  const [failure, setFailure] = useState<SessionFailure | null>(null);
  const [round, setRound] = useState(0);

  // One check chain per round, kept across React Strict Mode's effect
  // double-invocation so development also makes exactly one request.
  const chainRef = useRef<{ round: number; promise: Promise<SessionOutcome> } | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!chainRef.current || chainRef.current.round !== round) {
      chainRef.current = { round, promise: runSessionCheck() };
    }
    setStatus("loading");
    setFailure(null);
    chainRef.current.promise.then((outcome) => {
      if (cancelled) return;
      if ("user" in outcome) {
        setUser(outcome.user);
        setFailure(null);
        setStatus("ready");
      } else {
        setFailure(outcome.failure);
        setStatus(outcome.failure.kind);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [round]);

  const retry = useCallback(() => setRound((r) => r + 1), []);

  // Partner profile, loaded once per page for partners only.
  const isPartner = status === "ready" && user?.role === "partner";
  const [partner, setPartner] = useState<PartnerDetails | null>(null);
  const [isPartnerLoading, setIsPartnerLoading] = useState(false);
  const [partnerError, setPartnerError] = useState<string | null>(null);
  const [partnerRound, setPartnerRound] = useState(0);
  const partnerChainRef = useRef<{ key: string; promise: Promise<{ data: PartnerDetails }> } | null>(null);

  useEffect(() => {
    if (!isPartner) return;
    let cancelled = false;
    const key = `${user?.id ?? ""}:${partnerRound}`;
    if (!partnerChainRef.current || partnerChainRef.current.key !== key) {
      partnerChainRef.current = { key, promise: partnersApi.getProfile() };
    }
    setIsPartnerLoading(true);
    setPartnerError(null);
    partnerChainRef.current.promise
      .then((res) => {
        if (!cancelled) setPartner(res.data);
      })
      .catch((err) => {
        if (!cancelled) setPartnerError(parseApiError(err, "Failed to fetch partner"));
      })
      .finally(() => {
        if (!cancelled) setIsPartnerLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isPartner, user?.id, partnerRound]);

  const refetchPartner = useCallback(() => setPartnerRound((r) => r + 1), []);

  const value = useMemo<SessionContextValue>(
    () => ({ status, user, failure, retry, partner, isPartnerLoading, partnerError, refetchPartner }),
    [status, user, failure, retry, partner, isPartnerLoading, partnerError, refetchPartner],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

/** The shared session, or null when rendered outside a role layout. */
export function useSession(): SessionContextValue | null {
  return useContext(SessionContext);
}
