import { useState, useEffect } from "react";
import { programApi } from "../services";
import type { Program, GetProgramsParams } from "../types";
import { getCatalogueQuotaError, type CatalogueQuotaError } from "../utils/catalogueQuota";

export function usePrograms(params?: GetProgramsParams) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Set instead of a generic error when the partner's daily catalogue quota is used up (UBX-425).
  const [quota, setQuota] = useState<CatalogueQuotaError | null>(null);

  const fetch = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    setIsFetching(true);
    setError(null);
    setQuota(null);
    try {
      const res = await programApi.programs.list(params);
      const data = res.data;
      setPrograms(data?.items ?? data ?? []);
      setTotal(data?.total ?? 0);
    } catch (err) {
      const limit = getCatalogueQuotaError(err);
      setQuota(limit);
      setError(limit ? limit.message : "Failed to fetch programs");
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetch(programs.length === 0);
  }, [JSON.stringify(params)]);

  return { programs, total, loading, isFetching, error, quota, refetch: () => fetch(false) };
}
