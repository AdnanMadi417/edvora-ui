
import { useState, useEffect } from "react";
import api from "../../../lib/useApi";

export interface RequiredField {
  id: string;
  field_key: string;
  field_name: string;
  is_required: boolean;
}

export interface UniversityTypeDetails {
  id: string;
  name: string;
  description?: string;
  required_fields: RequiredField[];
}

export function useUniversityDetails(universityTypeId: string) {
  const [university, setUniversity] = useState<UniversityTypeDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!universityTypeId) return;

    const fetchUniversity = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await api.get(
          `/admin/university-types/${universityTypeId}`
        );

        setUniversity(res.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch university type details");
      } finally {
        setLoading(false);
      }
    };

    fetchUniversity();
  }, [universityTypeId]);

  return { university, loading, error };
}