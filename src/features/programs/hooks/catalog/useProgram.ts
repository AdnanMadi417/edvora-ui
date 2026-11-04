import { useState, useEffect } from "react";
import { programApi } from "../../services";
import type { Program, ExchangeRate } from "../../types";
import { getCatalogueQuotaError, type CatalogueQuotaError } from "../../utils/catalogueQuota";

export function useProgram(programId: string) {
  const [program, setProgram] = useState<Program | null>(null);
  const [requiredDocuments, setRequiredDocuments] = useState<NonNullable<Program["required_documents"]>>([]);
  const [commission, setCommission] = useState<Program["commission"] | null>(null);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Set instead of a generic error when the partner's daily catalogue quota is used up (UBX-425).
  const [quota, setQuota] = useState<CatalogueQuotaError | null>(null);

  const fetch = async () => {
    if (!programId) return;
    setLoading(true);
    setError(null);
    setQuota(null);
    try {
      const res = await programApi.programs.get(programId);
      setProgram(res.data.program);
      setRequiredDocuments(res.data.required_documents || []);
      setCommission(res.data.commission || null);
      setExchangeRates(res.data.exchange_rates || []);
    } catch (err) {
      const limit = getCatalogueQuotaError(err);
      setQuota(limit);
      setError(limit ? limit.message : "Failed to fetch program");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, [programId]);

  return { program, requiredDocuments, commission, exchangeRates, loading, error, quota, refetch: fetch };
}
