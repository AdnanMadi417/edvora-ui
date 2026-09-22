import { useState } from "react";
import { accountManagersApi } from "../services";
import type { TransferPartnersPayload, TransferPartnersResult } from "../types";
import { parseApiError } from "utils/parseApiError";

/**
 * Moves every partner (or a subset) from one account manager to another.
 * Always sends `mode: "move"` unless the caller overrides it — the field is
 * reserved for a future share/copy option that will reuse this hook.
 */
export function useTransferPartners() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transferPartners = async (
    sourceManagerId: string,
    payload: TransferPartnersPayload
  ): Promise<TransferPartnersResult> => {
    setLoading(true);
    setError(null);
    try {
      const res = await accountManagersApi.transferPartners(sourceManagerId, {
        mode: "move",
        ...payload,
      });
      return res.data;
    } catch (err: unknown) {
      setError(parseApiError(err, "Failed to transfer partners"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { transferPartners, loading, error };
}
