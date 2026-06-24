import { useState } from "react";
import api from "lib/useApi";
import Cookies from "js-cookie";

export function useDeleteField() {
  const [isDeleting, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  const deleteField = async (fieldId: string) => {
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const token = Cookies.get("token");
      await api.delete(`/knowledge-hub/fields-of-study/${fieldId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.detail?.[0]?.msg || "Failed to delete field of study");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteField, isDeleting, error, success };
}
