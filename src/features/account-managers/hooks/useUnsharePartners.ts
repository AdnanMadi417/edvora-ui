import { useState } from "react";
import { accountManagersApi } from "../services";
import type { UnsharePartnersPayload, UnsharePartnersResult } from "../types";
import { parseApiError } from "utils/parseApiError";

/** Removes another manager's shared access to a manager's partners (UBX-324). */
export function useUnsharePartners() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unsharePartners = async (
    sourceManagerId: string,
    payload: UnsharePartnersPayload
  ): Promise<UnsharePartnersResult> => {
    setLoading(true);
    setError(null);
    try {
      const res = await accountManagersApi.unsharePartners(sourceManagerId, payload);
      return res.data;
    } catch (err: unknown) {
      setError(parseApiError(err, "Failed to remove shared access"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { unsharePartners, loading, error };
}
