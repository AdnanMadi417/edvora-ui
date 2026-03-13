import { useState } from "react";
import api from "lib/useApi";
import Cookies from "js-cookie";

export function useDeleteAccountManager() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  const deleteAccountManager = async (managerId: string) => {
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const token = Cookies.get("token");

      await api.delete(`/admin/account-managers/${managerId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      setSuccess(true);
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.detail?.[0]?.msg ||
        "Failed to delete account manager"
      );

      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteAccountManager,
    loading,
    error,
    success,
  };
}