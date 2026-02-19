import { useState } from "react";
import api from "lib/useApi";
import Cookies from "js-cookie";

export interface EditAccountManagerPayload {
  name: string;
  email: string;
  password?: string;
  is_active: boolean;
}

export function useEditAccountManager(managerId?: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editAccountManager = async (payload: EditAccountManagerPayload) => {
    if (!managerId) {
      throw new Error("Manager ID is required");
    }

    try {
      setLoading(true);
      setError(null);

      const res = await api.put(
        `/admin/account-managers/${managerId}`,
        payload
      );

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
