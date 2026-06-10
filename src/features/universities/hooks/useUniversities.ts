import { useState, useEffect } from "react";
import { universityApi } from "../services";
import type { University } from "../types";

export function useUniversities() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await universityApi.universities.list();
      setUniversities(res.data?.items ?? res.data ?? []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch universities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  return { universities, loading, error, refetch: fetch };
}
