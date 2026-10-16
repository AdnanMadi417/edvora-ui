import { useState } from "react";
import { partnerBankAccountsApi } from "../services";
import type { PartnerBankAccount } from "../types";
import { parseApiError } from "utils/parseApiError";

// Fetched on demand (not on mount) — only needed when the admin opens the
// history view, not on every bank-account section render.
export function usePartnerBankAccountHistory() {
  const [history, setHistory] = useState<PartnerBankAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async (partnerId: string, currency?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await partnerBankAccountsApi.history(partnerId, currency);
      setHistory(res.data ?? []);
    } catch (err: unknown) {
      setError(parseApiError(err, "Failed to fetch bank account history"));
    } finally {
      setLoading(false);
    }
  };

  return { history, loading, error, fetchHistory };
}
