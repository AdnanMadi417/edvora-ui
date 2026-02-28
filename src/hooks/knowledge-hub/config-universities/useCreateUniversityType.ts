import { useState } from "react";
import api from "../../../lib/useApi";
import Cookies from "js-cookie";

export type CreateUniversityPayload = {
  name: string;
  description: string;
};

export function useCreateUniversityType() {
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
        "/admin/university-types",
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