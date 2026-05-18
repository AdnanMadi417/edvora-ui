import { useState } from "react";
import { universityApi } from "../services";
import type { UpdateUniversityPayload } from "../types";

export function useUpdateUniversity(universityId: string) {
  const [updateLoading, setLoading] = useState(false);
  const [updateError, setError] = useState<string | null>(null);

  const updateUniversity = async (payload: UpdateUniversityPayload) => {
    if (!universityId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await universityApi.universities.update(universityId, payload);
      return res.data;
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Update university failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateUniversity, updateLoading, updateError };
}
