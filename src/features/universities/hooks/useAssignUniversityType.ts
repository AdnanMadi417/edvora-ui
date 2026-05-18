import { useState } from "react";
import { universityApi } from "../services";
import type { AssignUniversityTypePayload, UniversityTypeResponse } from "../types";

export function useAssignUniversityType(universityId: string | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [data, setData] = useState<UniversityTypeResponse | null>(null);

  const assignUniversityType = async (payload: AssignUniversityTypePayload) => {
    if (!universityId) throw new Error("University ID is required");
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const res = await universityApi.types.assignToUniversity(universityId, payload);
      setData(res.data);
      setSuccess(true);
      return res.data;
    } catch (err: any) {
      setError(err?.response?.data?.detail?.[0]?.msg || "Failed to assign university type");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { assignUniversityType, loading, error, success, data };
}
