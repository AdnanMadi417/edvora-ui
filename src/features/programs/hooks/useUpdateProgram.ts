import { useState } from "react";
import { programApi } from "../services";
import type { UpdateProgramPayload } from "../types";
import { parseApiError } from "utils/parseApiError";

export function useUpdateProgram() {
  const [updateProgrLoading, setLoading] = useState(false);
  const [updateProgrError, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const resetState = () => {
    setError("");
    setSuccess(false);
  };

  const updateProgram = async (programId: string, payload: UpdateProgramPayload) => {
    setLoading(true);
    resetState();

    const sanitized = {
      ...payload,
      name: payload.name.trim(),
      overview: payload.overview?.trim() ?? "",
      curriculum: payload.curriculum?.trim() ?? "",
      english_required_score: payload.english_required_score?.trim() ?? "",
      tuition_fee: Number(payload.tuition_fee) || 0,
      duration: Number(payload.duration) || 0,
      intake_months: Array.isArray(payload.intake_months) ? payload.intake_months : [],
      yearly_fees: Array.isArray(payload.yearly_fees) ? payload.yearly_fees : [],
      one_time_fees: Array.isArray(payload.one_time_fees) ? payload.one_time_fees : [],
      scholarships: payload.has_scholarship && Array.isArray(payload.scholarships) ? payload.scholarships : [],
      commission_amount: payload.commission_amount ?? null,
      commission_type_id: payload.commission_type_id ?? null,
      commission_notes: payload.commission_notes?.trim() ?? null,
      expected_commission_from: payload.expected_commission_from ?? null,
      expected_commission_to: payload.expected_commission_to ?? null,
    };

    try {
      const res = await programApi.programs.update(programId, sanitized);
      setSuccess(true);
      return res.data;
    } catch (err: unknown) {
      setError(parseApiError(err, "Failed to update program"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateProgram, updateProgrLoading, updateProgrError, success, resetState };
}
