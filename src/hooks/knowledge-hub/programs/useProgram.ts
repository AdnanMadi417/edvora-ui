import { useState, useEffect } from "react";
import api from "../../../lib/useApi";
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

export type University = {
  id: string;
  name: string;
  country: string;
  is_active: boolean;
  description: string | null;
  state: string | null;
  intake_months: string[] | null;
};

export type Scholarship = {
  id: string;
  type: string;
  coverage_percent: number;
  max_amount: number;
  name: string ;
  description: string;
  conditions : string[];
};

type YearlyFee = {
  year: number;
  fee: number;
};

type OneTimeFee = {
  description: string;
  fee: number;
};

export type Commission = {
  amount: number | null;
  type: string | null;
  notes: string | null;
  expected_commission_from:string;
  expected_commission_to:string;

};

export type Program = {
  id: string;
  name: string;

  tuition_fee: number | null;
  first_year_tuition: number | null;

  intake_dates: string[] | null;
  next_intake: string | null;

  duration: number | null;

  branch: Branch;
  yearly_fees: YearlyFee[];
  one_time_fees: OneTimeFee[];

  english_required_score: number | null;

  overview: string | null;
  curriculum: string | null;

  is_on_campus: boolean;
  is_online: boolean;
  class_type: "physical" | "online" | string;

  has_scholarship: boolean;
  scholarships: Scholarship[];

  commission: Commission | null;

  qualification_level: "bachelor" | "master" | "phd" | string;

  field_of_study: FieldOfStudy;
  university: University;

  required_documents: {
    id: string;
    type: string;
    code: string;
    description: string;
    is_init_app_doc: string;
    is_required_init_app_doc: boolean;
    is_required_for_init: boolean;
  }[];
};

export type GetProgramsParams = {
  level?: "undergraduate" | "graduate";
  field_of_study_id?: string;
  search?: string;
};

export function useProgram(programId: string) {
  const [program, setProgram] = useState<Program | null>(null);
  const [requiredDocuments, setRequiredDocuments] = useState<Program["required_documents"]>([]);
  const [commission, setCommission] = useState<Program["commission"] | null>(null);
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
        setProgram(res.data.program)
        setRequiredDocuments(res.data.required_documents);
        setCommission(res.data.commission || null);

      } catch (err) {
        setError("Failed to fetch program");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgram();
  }, [programId]);

  return { program, requiredDocuments, commission, loading, error };
}
