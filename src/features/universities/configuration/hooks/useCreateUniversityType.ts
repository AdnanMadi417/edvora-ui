import { useState } from "react";
import { universityConfigurationApi } from "features/universities/configuration/services";
import type { CreateUniversityTypePayload } from "features/universities/configuration/types";

export function useCreateUniversityType() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const createUniversityType = async (payload: CreateUniversityTypePayload) => {
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const res = await universityConfigurationApi.types.create(payload);
      setSuccess(true);
      return res.data;
    } catch (err: any) {
      setError(err?.response?.data?.detail?.[0]?.msg || "Failed to create university type");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createUniversityType, loading, error, success };
}
