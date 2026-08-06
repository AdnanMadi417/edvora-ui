import { useState } from "react";
import api from "lib/useApi";
import Cookies from "js-cookie";
import { parseApiError } from "utils/parseApiError";

export type CreateCommissionTypePayload = {
  name: string;
  description: string;
  is_default: boolean;
};

export function useCreateCommissionType() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  const createCommissionType = async (payload: CreateCommissionTypePayload) => {
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const token = Cookies.get("token");
      const res = await api.post("/knowledge-hub/commission-types", payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setSuccess(true);
      return res.data;
    } catch (err: unknown) {
      setError(parseApiError(err, "Failed to create commission type"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createCommissionType, loading, error, success };
}
