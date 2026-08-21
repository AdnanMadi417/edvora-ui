import { useState } from "react";
import { rolesApi } from "../services";
import type { UpdateRolePayload } from "../types";
import { parseApiError } from "utils/parseApiError";

export function useRenameRole() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const renameRole = async (id: number, payload: UpdateRolePayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await rolesApi.rename(id, payload);
      return res.data;
    } catch (err) {
      setError(parseApiError(err, "Failed to rename role"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { renameRole, loading, error };
}
