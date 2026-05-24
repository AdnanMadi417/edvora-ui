import { useState } from "react";
import api from "lib/useApi";

export interface ProgramScholarship {
  id: string;
  type: string;
  coverage_percent: number;
  max_amount: number;
  currency: string;
  name: string;
  description: string;
  conditions: string[];
}

export function useGetProgramScholarships() {
  const [scholarships, setScholarships] = useState<ProgramScholarship[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScholarships = async (programIds: string[]) => {
    setLoading(true);
    setError(null);
    setScholarships([]);

    try {
      const res = await api.post("/knowledge-hub/scholarships", {
        program_ids: programIds,
      });
      setScholarships(res.data);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || "Failed to fetch scholarships";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { scholarships, loading, error, fetchScholarships };
}
