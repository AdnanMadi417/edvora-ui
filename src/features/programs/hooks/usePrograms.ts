import { useState, useEffect } from "react";
import { programApi } from "../services";
import type { Program, GetProgramsParams } from "../types";

export function usePrograms(params?: GetProgramsParams) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    setIsFetching(true);
    setError(null);
    try {
      const res = await programApi.programs.list(params);
      const data = res.data;
      setPrograms(data?.items ?? data ?? []);
      setTotal(data?.total ?? 0);
    } catch {
      setError("Failed to fetch programs");
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetch(programs.length === 0);
  }, [JSON.stringify(params)]);

  return { programs, total, loading, isFetching, error, refetch: () => fetch(false) };
}
