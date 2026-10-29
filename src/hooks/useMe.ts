import { useState, useEffect } from "react";
import api from "lib/useApi";
import { useSession, SessionUser, AgencyMembership } from "components/context/SessionContext";

export type { AgencyMembership };
export type User = SessionUser;

interface MeState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

/**
 * The signed-in user. Inside a role layout this reads the shared session
 * (one /auth/me per page, see SessionContext); outside one it falls back to
 * fetching on its own so the hook keeps working anywhere.
 */
export function useMe() {
  const session = useSession();
  const hasProvider = session !== null;
  const [standalone, setStandalone] = useState<MeState>({ user: null, loading: false, error: null });

  useEffect(() => {
    if (hasProvider) return;
    let cancelled = false;
    const fetchUser = async () => {
      setStandalone({ user: null, loading: true, error: null });
      try {
        const response = await api.get("/auth/me");
        if (!cancelled) setStandalone({ user: response.data, loading: false, error: null });
      } catch (err: any) {
        if (!cancelled) setStandalone({ user: null, loading: false, error: err?.message || "Failed to fetch user data" });
      }
    };
    fetchUser();
    return () => {
      cancelled = true;
    };
  }, [hasProvider]);

  if (session) {
    return {
      user: session.user,
      loading: session.status === "loading",
      error: null,
    };
  }
  return standalone;
}
