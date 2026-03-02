import { useState, useEffect } from "react";
import api from "../../../lib/useApi";

export type ApplicationRequiredField = {
  id: string;
  field_key: string;
  is_required: boolean;
  field_name: string;
};

export interface University {
  id: string;
  name: string;
  description?: string;
  required_fields: ApplicationRequiredField[];
}

export function useUniversityTypes() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUniversities = async () => {
      setLoading(true);
      setError(null);

      try {
        const uniRes = await api.get(`/admin/university-types`);

        setUniversities(uniRes.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch university types");
      } finally {
        setLoading(false);
      }
    };

    fetchUniversities();
  }, []);

  return { universities, loading, error };
}
