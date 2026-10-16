import { useEffect, useState, useCallback } from "react";
import { statementApi } from "../services";
import type { PartnerStatementItem, WaitingOn } from "../types";
import { parseApiError } from "utils/parseApiError";

export interface UseStatementParams {
  page?: number;
  page_size?: number;
  waiting_on?: WaitingOn;
  member_partner_id?: string;
}

export function useStatement({ page = 1, page_size = 20, waiting_on, member_partner_id }: UseStatementParams = {}) {
  const [items, setItems] = useState<PartnerStatementItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatement = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await statementApi.list({ page, page_size, waiting_on, member_partner_id });
      setItems(res.data.items);
      setTotal(res.data.total);
    } catch (err: unknown) {
      setError(parseApiError(err, "Failed to fetch your statement"));
    } finally {
      setLoading(false);
    }
  }, [page, page_size, waiting_on, member_partner_id]);

  useEffect(() => {
    fetchStatement();
  }, [fetchStatement]);

  return { items, total, loading, error, refetch: fetchStatement };
}
