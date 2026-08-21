import { useState, useEffect, useMemo } from "react";
import { rolesApi } from "../services";
import type { Permission } from "../types";

export function useRolePermissions(roleId?: number) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (roleId === undefined) return;

    setLoading(true);
    setError(null);

    rolesApi
      .getRolePermissions(roleId)
      .then((res) => setPermissions(res.data ?? []))
      .catch(() => setError("Failed to fetch role permissions"))
      .finally(() => setLoading(false));
  }, [roleId]);

  const permissionIds = useMemo(
    () => new Set(permissions.map((p) => p.id)),
    [permissions]
  );

  return { permissions, permissionIds, loading, error };
}
