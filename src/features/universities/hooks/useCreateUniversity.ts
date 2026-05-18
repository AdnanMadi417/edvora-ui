import { useState } from "react";
import { universityApi } from "../services";
import type { CreateUniversityPayload } from "../types";

export function useCreateUniversity() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const createUniversity = async (data: CreateUniversityPayload) => {
    setLoading(true);
    setError("");
    setSuccess(false);
    const payload = {
      ...data,
      intake_months: (data.intake_months ?? []).filter((m) => m.trim() !== ""),
    };
    try {
      const res = await universityApi.universities.create(payload);
      setSuccess(true);
      return res.data;
    } catch (err: any) {
      setError(err?.response?.data?.detail?.[0]?.msg || "Failed to create university");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createUniversity, loading, error, success };
}
