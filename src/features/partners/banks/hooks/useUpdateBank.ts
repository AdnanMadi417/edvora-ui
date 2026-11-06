import { useState } from "react";
import { banksApi } from "../services";
import type { UpdateBankPayload } from "../types";
import { parseApiError } from "utils/parseApiError";

export function useUpdateBank() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateBank = async (id: string, payload: UpdateBankPayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await banksApi.update(id, payload);
      return res.data;
    } catch (err) {
      setError(parseApiError(err, "Failed to update bank"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateBank, loading, error };
}
