import { useState } from "react";
import { partnerBankAccountsApi } from "../services";
import type { CreatePartnerBankAccountPayload } from "../types";
import { parseApiError } from "utils/parseApiError";

export function useCreatePartnerBankAccount() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAccount = async (partnerId: string, payload: CreatePartnerBankAccountPayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await partnerBankAccountsApi.create(partnerId, payload);
      return res.data;
    } catch (err: unknown) {
      setError(parseApiError(err, "Failed to add bank account"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createAccount, loading, error };
}
