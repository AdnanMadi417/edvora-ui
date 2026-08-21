import { useState } from "react";
import { staffUsersApi } from "../services";
import { parseApiError } from "utils/parseApiError";

export function useSuspendStaffUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suspendStaffUser = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await staffUsersApi.suspend(userId);
      return res.data;
    } catch (err) {
      setError(parseApiError(err, "Failed to suspend staff user"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { suspendStaffUser, loading, error };
}
