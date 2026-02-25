import { useState } from "react";
import api from "../../../lib/useApi";
import Cookies from "js-cookie";

export type CreateQualificationsTypePayload = {
  name: string;
};

export type QualificationTypeResponse = {
  id: string;
  name: string;
};

export function useCreateQualificationsType() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  const createQualificationType = async (
    payload: CreateQualificationsTypePayload
  ): Promise<QualificationTypeResponse> => {
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const token = Cookies.get("token");

      const res = await api.post<QualificationTypeResponse>(
        "/knowledge-hub/qualifications",
        payload,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      setSuccess(true);
      return res.data;
    } catch (err: any) {
      console.error("Create qualifications type error:", err);

      const backendMessage =
        err?.response?.data?.detail?.[0]?.msg ||
        err?.response?.data?.message ||
        "Failed to create qualifications type";

      setError(backendMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createQualificationType,
    loading,
    error,
    success,
  };
}