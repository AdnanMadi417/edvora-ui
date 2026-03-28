import { useState, useCallback, useEffect } from "react";
import api from "../../../lib/useApi";
import Cookies from "js-cookie";

export interface UniversityRequiredField {
  id: string;
  field_key: string;
  field_name: string;
  is_required: boolean;
}

export interface University {
  id: string;
  name: string;
  university_type_id?: string;
  university_type_name?: string;
  required_fields: UniversityRequiredField[];
}

export function useGetUniversities() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [universitiesList, setData] = useState<University[]>([]);

  const fetchUniversities = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = Cookies.get("token");

      const res = await api.get("/admin/universities", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      setData(res.data || []);
      return res.data;
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.detail?.[0]?.msg ||
        "Failed to fetch universities"
      );

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUniversities();
  }, [fetchUniversities]);

  return {
    universitiesList,
    loading,
    error,
    refetch: fetchUniversities,
  };
}