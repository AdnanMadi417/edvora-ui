import { useState } from "react";
import { rolesApi } from "../services";
import type { CreateRolePayload } from "../types";
import { parseApiError } from "utils/parseApiError";

export function useCreateRole() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRole = async (payload: CreateRolePayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await rolesApi.create(payload);
      return res.data;
    } catch (err) {
      setError(parseApiError(err, "Failed to create role"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createRole, loading, error };
}
