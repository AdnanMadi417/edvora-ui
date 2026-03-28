import { useState } from "react";
import api from "../../../lib/useApi";
import Cookies from "js-cookie";

export function useDeleteUniversity() {
  const [isDeleting, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  const deleteUniversity = async (universityId: string) => {
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const token = Cookies.get("token");

      await api.delete(
        `/knowledge-hub/universities/${universityId}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      setSuccess(true);

    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.detail?.[0]?.msg ||
        "Failed to delete university"
      );

      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteUniversity,
    isDeleting,
    error,
    success,
  };
}