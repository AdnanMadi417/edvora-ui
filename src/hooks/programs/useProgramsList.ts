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

export type Program = {
  id: string;
  name: string;
  tuition_fee: number;
  commission_rate?: number;
  qualification_level: string;
  field_of_study?: FieldOfStudy;
  university: University;
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
