import { useState } from "react";
import api from "lib/useApi";
import Cookies from "js-cookie";

export function useDeletePartner() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  const deletePartner = async (partnerId: string) => {
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const token = Cookies.get("token");

      await api.delete(`/admin/partners/${partnerId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      setSuccess(true);
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.detail?.[0]?.msg ||
        "Failed to delete partner."
      );

      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    deletePartner,
    loading,
    error,
    success,
  };
}