import { useState } from "react";
import { universityApi } from "../services";
import type { UpdateUniversityTypePayload } from "../types";

export function useUpdateUniversityType(universityTypeId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const updateUniversityType = async (payload: UpdateUniversityTypePayload) => {
    if (!universityTypeId) return;
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const res = await universityApi.types.update(universityTypeId, payload);
      setSuccess(true);
      return res.data;
    } catch (err: any) {
      setError(err?.response?.data?.detail?.[0]?.msg || "Failed to update university type");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateUniversityType, loading, error, success };
}
