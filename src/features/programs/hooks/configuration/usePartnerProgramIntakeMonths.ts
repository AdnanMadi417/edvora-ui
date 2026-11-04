import { useState, useEffect } from "react";
import { programApi } from "../../services";

export function usePartnerProgramIntakeMonths(programId: string, partnerId: string) {
  const [intakeMonths, setIntakeMonths] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!programId || !partnerId) return;

    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await programApi.partnerIntakeMonths.list(partnerId, programId);
        setIntakeMonths(res.data.intake_months || []);
      } catch (err: any) {
        setError(err?.response?.data?.detail || "Failed to fetch intake months");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [programId, partnerId]);

  return { intakeMonths, loading, error };
}
