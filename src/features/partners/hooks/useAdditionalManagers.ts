import { useState } from "react";
import { partnersApi } from "../services";
import type { AdditionalManagersResult } from "../types";
import { parseApiError } from "utils/parseApiError";

/**
 * Add or remove one shared (additional, non-primary) manager on a single
 * partner — UBX-324. Both calls resolve to the partner's current list.
 */
export function useAdditionalManagers() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (call: () => Promise<{ data: AdditionalManagersResult }>, fallback: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await call();
      return res.data;
    } catch (err: unknown) {
      setError(parseApiError(err, fallback));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addManager = (partnerId: string, managerId: string) =>
    run(() => partnersApi.addAdditionalManager(partnerId, managerId), "Failed to add the manager");

  const removeManager = (partnerId: string, managerId: string) =>
    run(() => partnersApi.removeAdditionalManager(partnerId, managerId), "Failed to remove the manager");

  return { addManager, removeManager, loading, error };
}
