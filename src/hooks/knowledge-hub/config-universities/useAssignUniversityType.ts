import { useState } from "react";
import api from "lib/useApi";
import Cookies from "js-cookie";

export interface AssignUniversityTypePayload {
  university_type_id: string | null;
}

export interface UniversityTypeResponse {
  id: string;
  name: string;
  university_type_id: string | null;
  university_type_name: string | null;
}

export function useAssignUniversityType(
  universityId: string | null
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [data, setData] =
    useState<UniversityTypeResponse | null>(null);

  const assignUniversityType = async (
    payload: AssignUniversityTypePayload
  ) => {
    if (!universityId) {
      throw new Error("University ID is required");
    }

    try {
      setLoading(true);
      setError("");
      setSuccess(false);

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
        "Failed to assign university type"
      );

      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    assignUniversityType,
    loading,
    error,
    success,
    data,
  };
}