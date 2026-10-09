import { useState, useEffect } from "react";
import api from "lib/useApi";
import { useMe } from "hooks/useMe";

interface Program {
  id: string;
  name: string;
  created_at: string;
}

export interface University {
  id: string;
  name: string;
  country: string;
  is_active: boolean;
  programs: Program[];
}

export function useUniversities() {
  const { user, loading: userLoading, error: userError } = useMe();
  const partnerId = user?.partner_id ?? null;
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // The partner id comes from the shared session instead of a second
    // /auth/me call. Nothing to fetch until it is known.
    if (!partnerId) {
      if (userError) setError(userError);
      return;
    }
    let cancelled = false;
    const fetchUniversities = async () => {
      setLoading(true);
      setError(null);

      try {
        const uniRes = await api.get(`/partners/${partnerId}/universities`);
        if (!cancelled) setUniversities(uniRes.data.items || []);
      } catch (err: any) {
        if (!cancelled) setError(err.message || "Failed to fetch universities");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchUniversities();
    return () => {
      cancelled = true;
    };
  }, [partnerId, userError]);

  return { universities, loading: loading || userLoading, error };
}
