import { useState } from "react";
import api from "../../lib/useApi";
import Cookies from "js-cookie";

export type CreateFieldOfStudyPayload = {
  name: string;
  is_active: boolean;
};

export function useCreateFieldOfStudy() {
  const [fieldLoading, setLoading] = useState<boolean>(false);
  const [fieldError, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  const CreateFieldOfStudy = async (data: CreateFieldOfStudyPayload) => {
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const token = Cookies.get("token");

      const res = await api.post(
        "/knowledge-hub/fields-of-study",
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
    CreateFieldOfStudy,
    fieldLoading,
    fieldError,
    success,
  };
}