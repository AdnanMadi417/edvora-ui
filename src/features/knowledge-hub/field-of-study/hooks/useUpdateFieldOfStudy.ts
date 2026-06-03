import { useState } from "react";
import api from "lib/useApi";
import Cookies from "js-cookie";

export type UpdateFieldOfStudyPayload = {
  name: string;
  is_active: boolean;
};

export function useUpdateFieldOfStudy(fieldId: string) {
  const [fieldLoading, setLoading] = useState<boolean>(false);
  const [fieldError, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  const updateFieldOfStudy = async (data: UpdateFieldOfStudyPayload) => {
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const token = Cookies.get("token");
      const res = await api.put(`/knowledge-hub/fields-of-study/${fieldId}`, data, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setSuccess(true);
      return res.data;
    } catch (err: any) {
      setError(err?.response?.data?.detail?.[0]?.msg || "Failed to update field of study");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateFieldOfStudy, fieldLoading, fieldError, success };
}
