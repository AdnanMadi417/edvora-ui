import { useState, useEffect } from "react";
import api from "../../../lib/useApi";

export interface University {
  id: string;
  name: string;
  country: string;
  is_active: boolean;
  description?: string;

  logo_file_key: string;
  logo_file_url: string;

  university_type_id: string;
  university_type_name: string;

  intake_months?: string[];
}

export function useAllUniversities() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUniversities = async () => {
      setLoading(true);
      setError(null);

      try {
        const uniRes = await api.get(`/knowledge-hub/universities`);
        setUniversities(uniRes.data);
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
