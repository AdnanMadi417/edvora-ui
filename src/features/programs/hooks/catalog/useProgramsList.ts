import { useState, useEffect, useCallback } from "react";
import api from "lib/useApi";
import Cookies from "js-cookie";

export type FieldOfStudy = {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
};

export type Branch = {
  id: string;
  name: string;
  location: string;
  state: string;
};

export type Program = {
  id: string;
  name: string;
  tuition_fee: number | null;
  first_year_tuition: number | null;
  branch: Branch | null;
  intake_months: number[] | null;
  next_intake_month: number | null;
  duration: number | null;
  yearly_fees: { year: string; fee: string }[];
  one_time_fees: number[];
  english_required_score: number | null;
  overview: string | null;
  curriculum: string | null;
  has_scholarship: string | null;
  is_on_campus: boolean;
  is_online: boolean;
  commission_amount: number | null;
  qualification_level: "bachelor" | "master" | "phd" | string;
  field_of_study: FieldOfStudy;
  university: {
    id: string;
    name: string;
    country: string;
    is_active: boolean;
    logo_file_key: string;
    logo_file_url: string;
    description: string | null;
    state: string | null;
    intake_months: number[] | null;
  };
};

export type GetProgramsParams = {
  level?: "undergraduate" | "graduate";
  field_of_study_id?: string;
  search?: string;
};

export function useAllPrograms(params?: GetProgramsParams) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Refetch when the params' values change, not on every new object from the caller.
  const paramsKey = JSON.stringify(params ?? null);

  const fetchPrograms = useCallback(async () => {
    setLoading(true);
    try {
      const token = Cookies.get("token");
      const res = await api.get("/knowledge-hub/programs", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        params: JSON.parse(paramsKey) ?? undefined,
      });
      setPrograms(res.data?.items ?? res.data ?? []);
    } catch (err) {
      setError("Failed to fetch programs");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [paramsKey]);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  return { programs, loading, error, refetch: fetchPrograms };
}
