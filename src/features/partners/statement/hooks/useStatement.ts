import { useEffect, useState, useCallback, useRef } from "react";
import { statementApi } from "../services";
import type { PartnerStatementItem, WaitingOn } from "../types";
import { parseApiError } from "utils/parseApiError";

export interface UseStatementParams {
  page?: number;
  page_size?: number;
  waiting_on?: WaitingOn;
  member_partner_id?: string;
}

export function useStatement({
  page = 1,
  page_size = 20,
  waiting_on,
  member_partner_id,
}: UseStatementParams = {}) {
  const [items, setItems] = useState<PartnerStatementItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requestVersion = useRef(0);

  const fetchStatement = useCallback(async () => {
    const version = ++requestVersion.current;
    setLoading(true);
    setError(null);
    try {
      const res = await statementApi.list({
        page,
        page_size,
        waiting_on,
        member_partner_id,
      });
      if (version !== requestVersion.current) return;
      setItems(res.data.items);
      setTotal(res.data.total);
    } catch (err: unknown) {
      if (version === requestVersion.current)
        setError(parseApiError(err, "Failed to fetch your statement"));
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  }, [page, page_size, waiting_on, member_partner_id]);

  useEffect(() => {
    fetchStatement();
    return () => {
      requestVersion.current += 1;
    };
  }, [fetchStatement]);

  return { items, total, loading, error, refetch: fetchStatement };
}
