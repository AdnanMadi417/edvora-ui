import { useState, useEffect } from "react";
import api from "lib/useApi";
import Cookies from "js-cookie";

export type FieldOfStudy = {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
};

export type University = {
  id: string;
  name: string;
  country: string;
  is_active: boolean;
};

type YearlyFee = {
  year: number;
  fee: number;
};

type OneTimeFees = {
  description: string;
  fee: number;
};

export type Program = {
  id: string;
  name: string;

  tuition_fee: number | null;
  first_year_tuition: number | null;

  intake_dates: string[] | null;
  next_intake: string | null;

  duration: number | null;

  yearly_fees: YearlyFee[];

  One_time_fees: OneTimeFees[];
  one_time_fees: { description: string; fee: number }[];

  english_required_score: number | null;

  overview: string | null;
  curriculum: string | null;

  is_on_campus: boolean;
  is_online: boolean;

  commission_rate: number | null;

  qualification_level: "bachelor" | "master" | "phd" | string;

  field_of_study: {
    id: string;
    name: string;
    code: string;
    is_active: boolean;
  };

  university: {
    id: string;
    name: string;
    country: string;
    is_active: boolean;
    description: string | null;
    state: string | null;
    intake_months: string[] | null;
  };
};


export type GetProgramsParams = {
  level?: "undergraduate" | "graduate";
  field_of_study_id?: string;
  search?: string;
};

export function useProgram(programId: string) {
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!programId) return;

    const fetchProgram = async () => {
      setLoading(true);
      try {
        const token = Cookies.get("token");
        const res = await api.get(`/knowledge-hub/programs/${programId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setProgram(res.data);
      } catch (err) {
        setError("Failed to fetch program");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgram();
  }, [programId]);

  return { program, loading, error };
}
