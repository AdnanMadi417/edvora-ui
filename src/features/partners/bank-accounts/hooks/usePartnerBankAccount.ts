import { useCallback, useEffect, useState } from "react";
import { partnerBankAccountsApi } from "../services";
import type { PartnerBankAccount } from "../types";
import { parseApiError } from "utils/parseApiError";

// GET returns a list, but there's at most one active account per partner —
// treat it as "0 or 1" and surface just that single record.
export function usePartnerBankAccount(partnerId: string) {
  const [account, setAccount] = useState<PartnerBankAccount | null>(null);
  // Starts true: the view briefly rendered "No payout bank account on file
  // yet." for partners who actually have one, in the single frame before
  // the fetch effect below had a chance to set it.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccount = useCallback(() => {
    if (!partnerId) return Promise.resolve();
    setLoading(true);
    setError(null);
    return partnerBankAccountsApi
      .list(partnerId)
      .then((res) => setAccount(res.data?.[0] ?? null))
      .catch((err) => setError(parseApiError(err, "Failed to fetch bank account")))
      .finally(() => setLoading(false));
  }, [partnerId]);

  useEffect(() => {
    fetchAccount();
  }, [fetchAccount]);

  return { account, loading, error, refetch: fetchAccount };
}
