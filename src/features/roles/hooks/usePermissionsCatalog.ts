import { useState, useEffect } from "react";
import { rolesApi } from "../services";
import type { Permission } from "../types";

export function usePermissionsCatalog() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    rolesApi
      .listPermissionsCatalog()
      .then((res) => setPermissions(res.data ?? []))
      .catch(() => setError("Failed to fetch permission catalog"))
      .finally(() => setLoading(false));
  }, []);

  return { permissions, loading, error };
}
