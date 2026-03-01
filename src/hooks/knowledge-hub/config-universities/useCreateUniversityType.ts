import { useState } from "react";
import api from "../../../lib/useApi";
import Cookies from "js-cookie";

interface RequiredFieldPayload {
  application_submission_field_id: string;
  is_required: boolean;
}

export interface CreateUniversityTypePayload {
  name: string;
  description?: string;
  required_fields?: RequiredFieldPayload[];
}

interface CreateUniversityTypeResponse {
  id: string;
  name: string;
  description?: string;
}

export function useCreateUniversityType() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [data, setData] = useState<CreateUniversityTypeResponse | null>(null);

  const createUniversityType = async (
    payload: CreateUniversityTypePayload
  ) => {
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const token = Cookies.get("token");

      const res = await api.post(
        "/admin/university-types",
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
        "Failed to create university type"
      );

      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createUniversityType,
    loading,
    error,
    success,
    data,
  };
}