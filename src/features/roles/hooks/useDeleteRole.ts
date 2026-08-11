import { useState } from "react";
import { rolesApi } from "../services";
import { parseApiError } from "utils/parseApiError";

export function useDeleteRole() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteRole = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await rolesApi.delete(id);
    } catch (err) {
      setError(parseApiError(err, "Failed to delete role"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteRole, loading, error };
}
