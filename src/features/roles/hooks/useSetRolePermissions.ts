import { useState } from "react";
import { rolesApi } from "../services";
import { parseApiError } from "utils/parseApiError";

export function useSetRolePermissions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setRolePermissions = async (roleId: number, permissionIds: string[]) => {
    setLoading(true);
    setError(null);
    try {
      await rolesApi.setRolePermissions(roleId, permissionIds);
    } catch (err) {
      setError(parseApiError(err, "Failed to update role permissions"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { setRolePermissions, loading, error };
}
