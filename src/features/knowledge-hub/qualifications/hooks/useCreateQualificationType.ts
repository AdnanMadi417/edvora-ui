import { useState } from "react";
import api from "lib/useApi";
import Cookies from "js-cookie";
import { parseApiError } from "utils/parseApiError";

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
      const res = await api.post<QualificationTypeResponse>("/knowledge-hub/qualifications", payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setSuccess(true);
      return res.data;
    } catch (err: unknown) {
      setError(parseApiError(err, "Failed to create qualification type"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createQualificationType, loading, error, success };
}
