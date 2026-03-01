import { useState } from "react";
import api from "../../../lib/useApi";
import Cookies from "js-cookie";

interface RequiredFieldPayload {
  id: string;
  is_required: boolean;
}

interface UpdateUniversityTypePayload {
  name: string;
  description?: string;
  required_fields: RequiredFieldPayload[];
}

export function useUpdateUniversityType(universityTypeId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);

  const updateUniversityType = async (
    payload: UpdateUniversityTypePayload
  ) => {
    if (!universityTypeId) return;

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const token = Cookies.get("token");

      const res = await api.put(
        `/admin/university-types/${universityTypeId}`,
        payload,
        {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
        }
      );

      setSuccess(true);
      return res.data;
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.detail?.[0]?.msg ||
        "Failed to update university type"
      );

      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateUniversityType,
    loading,
    error,
    success,
  };
}