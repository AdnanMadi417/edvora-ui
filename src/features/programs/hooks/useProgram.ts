import { useState, useEffect } from "react";
import { programApi } from "../services";
import type { Program } from "../types";

export function useProgram(programId: string) {
  const [program, setProgram] = useState<Program | null>(null);
  const [requiredDocuments, setRequiredDocuments] = useState<NonNullable<Program["required_documents"]>>([]);
  const [commission, setCommission] = useState<Program["commission"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = async () => {
    if (!programId) return;
    setLoading(true);
    try {
      const res = await programApi.programs.get(programId);
      setProgram(res.data.program);
      setRequiredDocuments(res.data.required_documents || []);
      setCommission(res.data.commission || null);
    } catch {
      setError("Failed to fetch program");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, [programId]);

  return { program, requiredDocuments, commission, loading, error, refetch: fetch };
}
