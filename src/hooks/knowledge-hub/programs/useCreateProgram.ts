import { useState, useRef } from "react";
import api from "../../../lib/useApi";
import { AxiosError } from "axios";

export type CreateProgramPayload = {
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
  expected_commission_from: string;
  expected_commission_to: string;

  qualification_id: string;

  yearly_fees?: Array<{
    year: number;
    fee: number;
  }>;

  one_time_fees?: Array<{
    description: string;
    fee: number;
  }>;

  scholarships?: Array<{
    type: number;
    coverage_percent: number;
    max_amount: number;
    name: string;
    description: string;
    conditions: string[];
  }>;
};

export function useCreateProgram() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const requestCounter = useRef(0);

  const resetState = () => {
    setError("");
    setSuccess(false);
  };

  const sanitizeArray = <T,>(arr?: T[]) => {
    if (!arr) return [];

    return arr.filter(
      (v) => v !== null && v !== undefined && v !== ""
    );
  };

  const createProgram = async (payload: CreateProgramPayload) => {
    const requestId = ++requestCounter.current;

    setLoading(true);
    resetState();

    try {
      const sanitizedPayload = {
        ...payload,

        name: payload.name?.trim(),
        overview: payload.overview?.trim(),
        curriculum: payload.curriculum?.trim(),
        commission_notes: payload.commission_notes?.trim(),

        intake_dates: sanitizeArray(payload.intake_dates),
        yearly_fees: payload.yearly_fees ?? [],
        one_time_fees: payload.one_time_fees ?? [],

        scholarships: payload.has_scholarship
          ? payload.scholarships ?? []
          : [],
      };

      const res = await api.post(
        "/knowledge-hub/programs",
        sanitizedPayload
      );

      if (requestId !== requestCounter.current) return;

      setSuccess(true);
      return res.data;
    } catch (err: unknown) {
      const error = err as AxiosError<any>;

      console.error("Create program error:", error);

      const apiDetail = error.response?.data?.detail;

      if (Array.isArray(apiDetail)) {
        setError(apiDetail[0]?.msg || "Failed to create program");
      } else {
        setError(
          error.response?.data?.message ||
          "Failed to create program"
        );
      }

      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createProgram,
    loading,
    error,
    success,
    resetState,
  };
}