import { useState } from "react";
import { programApi } from "../services";
import type { UpdateProgramRequest } from "../types";
import { parseApiError } from "utils/parseApiError";

const TRIMMED_FIELDS = ["name", "overview", "curriculum", "english_required_score", "commission_notes"] as const;

export function useUpdateProgram() {
  const [updateProgrLoading, setLoading] = useState(false);
  const [updateProgrError, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const resetState = () => {
    setError("");
    setSuccess(false);
  };

  const updateProgram = async (programId: string, payload: UpdateProgramRequest) => {
    setLoading(true);
    resetState();

    // The endpoint is a partial update and the form sends only what changed,
    // so nothing may be filled in here: a key defaulted to ""/0/[] would be
    // written back as if the user had cleared it. Only tidy what was sent.
    const sanitized: UpdateProgramRequest = { ...payload };
    TRIMMED_FIELDS.forEach((key) => {
      const value = sanitized[key];
      if (typeof value === "string") (sanitized as Record<string, unknown>)[key] = value.trim();
    });

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
