import { useState, useEffect, useCallback } from "react";
import api from "lib/useApi";
import Cookies from "js-cookie";

export interface RequiredFieldConfig {
  id: string;
  field_key: string;
  is_required: boolean;
  field_name: string;
}

export interface UniversityRequiredFieldsResponse {
  university_id: string;
  university_type_id: string | null;
  university_type_name: string | null;
  fields: RequiredFieldConfig[];
}

export function useUniversityRequiredFields(universityId: string | null) {
  const [data, setData] = useState<UniversityRequiredFieldsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const fetchRequiredFields = useCallback(async () => {
    if (!universityId) return;

    setLoading(true);
    setError("");

    try {
      const token = Cookies.get("token");
      const res = await api.get(
        `/applications/universities/${universityId}/required-fields`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      setData(res.data);
      return res.data;
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.detail?.[0]?.msg || "Failed to fetch required fields");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [universityId]);

  useEffect(() => {
    fetchRequiredFields();
  }, [fetchRequiredFields]);

  return { data, loading, error, refetch: fetchRequiredFields };
}
