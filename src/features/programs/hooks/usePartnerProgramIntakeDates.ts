import { useState, useEffect } from "react";
import { programApi } from "../services";

export function usePartnerProgramIntakeDates(programId: string, partnerId: string) {
  const [intakeDates, setIntakeDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!programId || !partnerId) return;

    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await programApi.partnerIntakeDates.list(partnerId, programId);
        setIntakeDates(res.data.intake_dates || []);
      } catch (err: any) {
        setError(err?.response?.data?.detail || "Failed to fetch intake dates");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [programId, partnerId]);

  return { intakeDates, loading, error };
}
