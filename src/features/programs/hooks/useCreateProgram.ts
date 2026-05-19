import { useState, useRef } from "react";
import { programApi } from "../services";
import type { CreateProgramPayload } from "../types";

export function useCreateProgram() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const requestCounter = useRef(0);

  const resetState = () => {
    setError("");
    setSuccess(false);
  };

  const createProgram = async (payload: CreateProgramPayload) => {
    const requestId = ++requestCounter.current;
    setLoading(true);
    resetState();

    try {
      const sanitized = {
        ...payload,
        name: payload.name?.trim(),
        overview: payload.overview?.trim(),
        curriculum: payload.curriculum?.trim(),
        commission_notes: payload.commission_notes?.trim(),
        intake_dates: (payload.intake_dates ?? []).filter((d) => d),
        yearly_fees: payload.yearly_fees ?? [],
        one_time_fees: payload.one_time_fees ?? [],
        scholarships: payload.has_scholarship ? (payload.scholarships ?? []) : [],
      };

      const res = await programApi.programs.create(sanitized);

      if (requestId !== requestCounter.current) return;

      setSuccess(true);
      return res.data;
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(
        Array.isArray(detail)
          ? detail[0]?.msg || "Failed to create program"
          : err?.response?.data?.message || "Failed to create program"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createProgram, loading, error, success, resetState };
}
