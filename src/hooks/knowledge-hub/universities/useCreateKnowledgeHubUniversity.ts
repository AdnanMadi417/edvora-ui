import { useState } from "react";
import api from "../../../lib/useApi";
import Cookies from "js-cookie";

export type CreateUniversityPayload = {
  name: string;
  country: string;
  is_active: boolean;
  description: string;
  intake_months: string[];
};

export function useCreateUniversity() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  const createUniversity = async (data: CreateUniversityPayload) => {
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const token = Cookies.get("token");

      const res = await api.post(
        "/knowledge-hub/universities",
        data,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      setSuccess(true);
      return res.data;
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.detail?.[0]?.msg ||
        "Failed to create university"
      );

      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createUniversity,
    loading,
    error,
    success,
  };
}