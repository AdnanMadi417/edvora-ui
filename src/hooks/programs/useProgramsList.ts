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

  intake_dates: string[] | null;
  next_intake: string | null;

  duration: number | null;

  yearly_fees: number[];
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

export function useAllPrograms(params?: GetProgramsParams) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrograms = async () => {
      setLoading(true);
      try {
        const token = Cookies.get("token");
        const res = await api.get("/knowledge-hub/programs", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          params,
        });
        setPrograms(res.data || []);
      } catch (err) {
        setError("Failed to fetch programs");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, [JSON.stringify(params)]); // Re-fetch when params change

  return { programs, loading, error };
}
