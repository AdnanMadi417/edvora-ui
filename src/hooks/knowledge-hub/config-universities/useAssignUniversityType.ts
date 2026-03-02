import { useState } from "react";
import api from "../../../lib/useApi";
import Cookies from "js-cookie";

interface UpdateUniversityTypePayload {
  university_type_id: string | null;
}

interface UniversityTypeResponse {
  id: string;
  name: string;
  university_type_id: string | null;
  university_type_name: string | null;
}

export function useUpdateUniversityType(universityId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);
  const [data, setData] = useState<UniversityTypeResponse | null>(null);

  const updateUniversityType = async (
    payload: UpdateUniversityTypePayload
  ) => {
    if (!universityId) return;

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const token = Cookies.get("token");

      const res = await api.put(
        `/admin/universities/${universityId}/type`,
        payload,
        {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
        }
      );

      setData(res.data);
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
    data,
  };
}