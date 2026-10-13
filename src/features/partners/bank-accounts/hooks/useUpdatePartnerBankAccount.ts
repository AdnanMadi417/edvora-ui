import { useState } from "react";
import { partnerBankAccountsApi } from "../services";
import type { UpdatePartnerBankAccountPayload } from "../types";
import { parseApiError } from "utils/parseApiError";

export function useUpdatePartnerBankAccount() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateAccount = async (partnerId: string, accountId: string, payload: UpdatePartnerBankAccountPayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await partnerBankAccountsApi.update(partnerId, accountId, payload);
      return res.data;
    } catch (err: unknown) {
      setError(parseApiError(err, "Failed to update bank account"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateAccount, loading, error };
}
