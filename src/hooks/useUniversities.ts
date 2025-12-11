import { useState, useEffect } from "react";
import api from "lib/useApi";

interface User {
  id: string;
  partner_id: string;
  name: string;
  email: string;
  role: string;
}

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
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUniversities = async () => {
      setLoading(true);
      setError(null);

      try {
        const userRes = await api.get("/auth/me");
        const userData: User = userRes.data;

        const uniRes = await api.get(`/partners/${userData.partner_id}/universities`);
        setUniversities(uniRes.data.items || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch universities");
      } finally {
        setLoading(false);
      }
    };

    fetchUniversities();
  }, []);

  return { universities, loading, error };
}
