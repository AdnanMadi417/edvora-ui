"use client";

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
  qualification_id: string;

  commission_amount?: number | null;
  commission_type_id?: string | null;
  commission_notes?: string | null;

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

  const normalizePayload = (payload: UpdateProgramPayload) => {
    return {
      ...payload,

      name: payload.name.trim(),
      overview: payload.overview?.trim() ?? "",
      curriculum: payload.curriculum?.trim() ?? "",
      english_required_score:
        payload.english_required_score?.trim() ?? "",

      tuition_fee: Number(payload.tuition_fee) || 0,
      duration: Number(payload.duration) || 0,

      intake_dates: Array.isArray(payload.intake_dates)
        ? payload.intake_dates
        : [],

      yearly_fees: Array.isArray(payload.yearly_fees)
        ? payload.yearly_fees
        : [],

      one_time_fees: Array.isArray(payload.one_time_fees)
        ? payload.one_time_fees
        : [],

      scholarships:
        payload.has_scholarship &&
        Array.isArray(payload.scholarships)
          ? payload.scholarships
          : [],

      commission_amount: payload.commission_amount ?? null,
      commission_type_id: payload.commission_type_id ?? null,
      commission_notes: payload.commission_notes?.trim() ?? null,
    };
  };

  const parseApiError = (err: any) => {
    const apiError =
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      err?.message;

    if (Array.isArray(apiError)) {
      return apiError[0]?.msg || "Failed to update program";
    }

    return apiError || "Failed to update program";
  };

  const updateProgram = async (
    programId: string,
    payload: UpdateProgramPayload
  ) => {
    setLoading(true);
    resetState();

    try {
      const sanitizedPayload = normalizePayload(payload);

      const res = await api.put(
        `/knowledge-hub/programs/${programId}`,
        sanitizedPayload
      );

      setSuccess(true);
      return res.data;
    } catch (err: any) {
      console.error("Update program error:", err);
      setError(parseApiError(err));
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