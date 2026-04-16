import { useState, useEffect } from "react";
import api from "../../../lib/useApi";
import Cookies from "js-cookie";

interface ProgramIntakeDates {
  program_id: string;
  intake_dates: string[];
}

export function usePartnerProgramIntakeDates(programId: string, partnerId: string) {
  const [intakeDates, setIntakeDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!programId || !partnerId) return;

    const fetchIntakeDates = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = Cookies.get("token");
        const res = await api.get<ProgramIntakeDates>(
          `/partners/${partnerId}/programs/${programId}/intake-dates`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        setIntakeDates(res.data.intake_dates || []);
      } catch (err: any) {
        console.error(err);
        setError(err?.response?.data?.detail || "Failed to fetch intake dates");
      } finally {
        setLoading(false);
      }
    };

    fetchIntakeDates();
  }, [programId, partnerId]);

  return { intakeDates, loading, error };
}
