import { useState } from "react";
import { staffUsersApi } from "../services";
import { parseApiError } from "utils/parseApiError";

export function useReactivateStaffUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reactivateStaffUser = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await staffUsersApi.reactivate(userId);
      return res.data;
    } catch (err) {
      setError(parseApiError(err, "Failed to reactivate staff user"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { reactivateStaffUser, loading, error };
}
