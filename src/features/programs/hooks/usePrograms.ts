import { useState, useEffect } from "react";
import { programApi } from "../services";
import type { Program, GetProgramsParams } from "../types";

export function usePrograms(params?: GetProgramsParams) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await programApi.programs.list(params);
      setPrograms(res.data || []);
    } catch {
      setError("Failed to fetch programs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, [JSON.stringify(params)]);

  return { programs, loading, error, refetch: fetch };
}
