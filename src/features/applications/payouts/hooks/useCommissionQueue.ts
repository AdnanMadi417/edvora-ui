import { useEffect, useState, useCallback } from "react";
import { commissionsApi } from "../services";
import type { CommissionQueueItem, WaitingOn } from "../types";
import { parseApiError } from "utils/parseApiError";

export interface UseCommissionQueueParams {
  page?: number;
  page_size?: number;
  partner_id?: string;
  waiting_on?: WaitingOn;
  hide_settled?: boolean;
}

export function useCommissionQueue({
  page = 1,
  page_size = 20,
  partner_id,
  waiting_on,
  hide_settled,
}: UseCommissionQueueParams = {}) {
  const [items, setItems] = useState<CommissionQueueItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await commissionsApi.list({ page, page_size, partner_id, waiting_on, hide_settled });
      setItems(res.data.items);
      setTotal(res.data.total);
    } catch (err: unknown) {
      setError(parseApiError(err, "Failed to fetch the finance queue"));
    } finally {
      setLoading(false);
    }
  }, [page, page_size, partner_id, waiting_on, hide_settled]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  return { items, total, loading, error, refetch: fetchQueue };
}
