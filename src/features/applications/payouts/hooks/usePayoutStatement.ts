import { useEffect, useState, useCallback } from "react";
import { payoutsApi } from "../services";
import type { PayoutStatementItem } from "../types";
import { parseApiError } from "utils/parseApiError";

export interface UsePayoutStatementParams {
  page?: number;
  page_size?: number;
  active_only?: boolean;
}

export function usePayoutStatement(
  partnerId: string,
  { page = 1, page_size = 20, active_only }: UsePayoutStatementParams = {}
) {
  const [items, setItems] = useState<PayoutStatementItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatement = useCallback(async () => {
    if (!partnerId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await payoutsApi.statement(partnerId, { page, page_size, active_only });
      setItems(res.data.items);
      setTotal(res.data.total);
    } catch (err: unknown) {
      setError(parseApiError(err, "Failed to fetch payout statement"));
    } finally {
      setLoading(false);
    }
  }, [partnerId, page, page_size, active_only]);

  useEffect(() => {
    fetchStatement();
  }, [fetchStatement]);

  return { items, total, loading, error, refetch: fetchStatement };
}
