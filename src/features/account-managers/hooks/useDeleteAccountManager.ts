import { useState } from "react";
import { accountManagersApi } from "../services";

export function useDeleteAccountManager() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const deleteAccountManager = async (managerId: string) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await accountManagersApi.delete(managerId);
      setSuccess(true);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail?.[0]?.msg || "Failed to delete account manager"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteAccountManager, loading, error, success };
}
