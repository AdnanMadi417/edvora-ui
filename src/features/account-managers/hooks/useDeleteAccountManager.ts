import { useState } from "react";
import { accountManagersApi } from "../services";
import { parseApiError } from "utils/parseApiError";

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
    } catch (err: unknown) {
      setError(parseApiError(err, "Failed to delete account manager"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteAccountManager, loading, error, success };
}
