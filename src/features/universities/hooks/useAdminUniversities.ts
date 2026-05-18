import { useState, useCallback, useEffect } from "react";
import { universityApi } from "../services";
import type { UniversityWithRequiredFields } from "../types";

export function useAdminUniversities() {
  const [universitiesList, setData] = useState<UniversityWithRequiredFields[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchUniversities = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await universityApi.adminUniversities.list();
      setData(res.data || []);
      return res.data;
    } catch (err: any) {
      setError(err?.response?.data?.detail?.[0]?.msg || "Failed to fetch universities");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUniversities();
  }, [fetchUniversities]);

  return { universitiesList, loading, error, refetch: fetchUniversities };
}
