import { useState } from "react";
import { banksApi } from "../services";
import type { CreateBankPayload } from "../types";
import { parseApiError } from "utils/parseApiError";

export function useCreateBank() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBank = async (payload: CreateBankPayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await banksApi.create(payload);
      return res.data;
    } catch (err) {
      setError(parseApiError(err, "Failed to create bank"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createBank, loading, error };
}
