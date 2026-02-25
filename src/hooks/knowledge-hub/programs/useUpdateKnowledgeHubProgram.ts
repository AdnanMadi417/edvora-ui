import { useState } from "react";
import api from "../../../lib/useApi";

export type UpdateProgramPayload = {
  uni_id: string;
  branch_id: string;
  field_of_study_id: string;
  name: string;
  tuition_fee: number;
  intake_dates: string[];
  duration: number;
  english_required_score: string;
  overview: string;
  curriculum: string;
  is_on_campus: boolean;
  is_online: boolean;
  has_scholarship: boolean;

  commission_amount: number;
  commission_type_id: string;
  commission_notes: string;
  qualification_level: number;

  yearly_fees?: Array<{ year: number; fee: number }>;
  one_time_fees?: Array<{ description: string; fee: number }>;

  scholarships?: Array<{
    type: number;
    coverage_percent: number;
    max_amount: number;
    name: string;
    description: string;
  }>;
};

export function useUpdateProgram() {
  const [updateProgrLoading, setLoading] = useState(false);
  const [updateProgrError, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const resetState = () => {
    setError("");
    setSuccess(false);
  };

  const updateProgram = async (
    programId: string,
    payload: UpdateProgramPayload
  ) => {
    setLoading(true);
    resetState();

    try {
      const sanitizedPayload = {
        ...payload,

        name: payload.name?.trim(),
        overview: payload.overview?.trim(),
        curriculum: payload.curriculum?.trim(),

        intake_dates: payload.intake_dates ?? [],
        yearly_fees: payload.yearly_fees ?? [],
        one_time_fees: payload.one_time_fees ?? [],

        scholarships: payload.has_scholarship
          ? payload.scholarships ?? []
          : [],
      };

      const res = await api.put(
        `/knowledge-hub/programs/${programId}`,
        sanitizedPayload
      );

      setSuccess(true);
      return res.data;
    } catch (err: any) {
      console.error("Update program error:", err);

      const apiDetail = err?.response?.data?.detail;

      if (Array.isArray(apiDetail)) {
        setError(apiDetail[0]?.msg || "Failed to update program");
      } else {
        setError(
          err?.response?.data?.message ||
          "Failed to update program"
        );
      }

      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateProgram,
    updateProgrLoading,
    updateProgrError,
    success,
    resetState,
  };
}