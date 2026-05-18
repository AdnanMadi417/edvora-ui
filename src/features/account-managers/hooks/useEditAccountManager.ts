import { useState } from "react";
import { accountManagersApi } from "../services";
import type { EditAccountManagerPayload } from "../types";

export function useEditAccountManager(managerId?: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editAccountManager = async (payload: EditAccountManagerPayload) => {
    if (!managerId) throw new Error("Manager ID is required");
    setLoading(true);
    setError(null);
    try {
      const res = await accountManagersApi.update(managerId, payload);
      return res.data;
    } catch (err) {
      setError("Failed to update account manager");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { editAccountManager, loading, error };
}
